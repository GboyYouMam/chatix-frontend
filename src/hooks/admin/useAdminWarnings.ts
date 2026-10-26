import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '../../lib/toast';
import type { AdminWarning } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminWarningListOptions,
} from '../../utils/adminQueryUtils.ts';
import { adminApi } from '../../api/admin/admin.service.ts';
import { adminKeys } from './adminKeys.ts';

export const useAdminWarnings = ({
    selectedUserId,
    page,
    limit = 10,
    search,
    enabled = true,
}: AdminWarningListOptions) => {
    const queryClient = useQueryClient();
    const warningsParams = { page, limit, search };

    const warningsQuery = useQuery({
        queryKey: adminKeys.warnings(selectedUserId, warningsParams),
        queryFn: () =>
            getPaginated<AdminWarning>(`/admin/users/${selectedUserId}/warnings`, warningsParams),
        enabled: enabled && Boolean(selectedUserId),
        placeholderData: keepPreviousData,
        staleTime: 10_000,
    });

    const invalidateUsers = () =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'list'] });
    const invalidateAuditLogs = () =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    const invalidateWarnings = (userId?: string | null) =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'warnings', userId] });

    const addWarning = useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            adminApi.addWarning(userId, reason),
        onSuccess: async (data, variables) => {
            if (data?.autoBanned) notify.info('3/3. this mf is cooked. autobanned for 7 days.');
            else notify.success('warning added.');
            if (data?.user) queryClient.setQueryData(adminKeys.user(variables.userId), data.user);
            await Promise.all([
                invalidateUsers(),
                invalidateWarnings(variables.userId),
                queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) }),
                invalidateAuditLogs(),
            ]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'Failed to add warning')),
    });

    const revokeWarning = useMutation({
        mutationFn: ({ userId, warningId }: { userId: string; warningId: string }) =>
            adminApi.revokeWarning(userId, warningId),
        onSuccess: async (_, variables) => {
            notify.success('warning revoked. the ban stays.');
            await Promise.all([
                invalidateUsers(),
                invalidateWarnings(variables.userId),
                queryClient.invalidateQueries({ queryKey: adminKeys.user(variables.userId) }),
                invalidateAuditLogs(),
            ]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'Failed to revoke warning')),
    });

    return {
        items: warningsQuery.data?.items ?? [],
        total: warningsQuery.data?.pagination.total ?? 0,
        isInitialLoading: warningsQuery.isLoading,
        warnings: warningsQuery.data?.items ?? [],
        pagination: warningsQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: warningsQuery.isLoading,
        isFetching: warningsQuery.isFetching,
        addWarning,
        revokeWarning,
    };
};
