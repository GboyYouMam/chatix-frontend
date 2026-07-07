import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/client.ts';
import type { AdminWarning } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminWarningListOptions,
} from '../../utils/adminQueryUtils.ts';

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
        queryKey: ['admin', 'warnings', selectedUserId, warningsParams],
        queryFn: () => getPaginated<AdminWarning>(`/admin/users/${selectedUserId}/warnings`, warningsParams),
        enabled: enabled && Boolean(selectedUserId),
    });

    const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    const invalidateAuditLogs = () => queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    const invalidateWarnings = (userId?: string | null) =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'warnings', userId] });

    const addWarning = useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            api.post(`/admin/users/${userId}/warnings`, { reason }),
        onSuccess: async (_, variables) => {
            toast.success('Warning added.');
            await Promise.all([
                invalidateUsers(),
                invalidateWarnings(variables.userId),
                invalidateAuditLogs(),
            ]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to add warning')),
    });

    const revokeWarning = useMutation({
        mutationFn: ({ userId, warningId }: { userId: string; warningId: string }) =>
            api.delete(`/admin/users/${userId}/warnings/${warningId}`),
        onSuccess: async (_, variables) => {
            toast.success('Warning revoked.');
            await Promise.all([
                invalidateUsers(),
                invalidateWarnings(variables.userId),
                invalidateAuditLogs(),
            ]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to revoke warning')),
    });

    return {
        warnings: warningsQuery.data?.items ?? [],
        pagination: warningsQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: warningsQuery.isLoading,
        isFetching: warningsQuery.isFetching,
        addWarning,
        revokeWarning,
    };
};
