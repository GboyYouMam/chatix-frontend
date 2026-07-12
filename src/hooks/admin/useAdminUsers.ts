import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AdminUser, UpdateModifiersPayload } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';
import {adminApi} from "../../api/admin/admin.service.ts";

export const useAdminUsers = ({
    page,
    limit = 25,
    search,
    enabled = true,
}: AdminListOptions) => {
    const queryClient = useQueryClient();
    const listParams = { page, limit, search };

    const usersQuery = useQuery({
        queryKey: ['admin', 'users', listParams],
        queryFn: () => getPaginated<AdminUser>('/admin/users', listParams),
        enabled,
    });

    const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    const invalidateAuditLogs = () => queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    const invalidateWarnings = (userId?: string | null) =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'warnings', userId] });

    const vaporizeUser = useMutation({
        mutationFn: (userId: string) => adminApi.vaporizeUser(userId),
        onSuccess: async () => {
            toast.success('User vaporized.');
            await Promise.all([invalidateUsers(), invalidateAuditLogs()]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to vaporize user')),
    });

    const updateModifiers = useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateModifiersPayload }) =>
            adminApi.updateModifier(userId, data),
        onSuccess: async (_, variables) => {
            toast.success('User modifiers updated.');
            await Promise.all([invalidateUsers(), invalidateAuditLogs(), invalidateWarnings(variables.userId)]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to update user')),
    });

    return {
        users: usersQuery.data?.items ?? [],
        pagination: usersQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: usersQuery.isLoading,
        isFetching: usersQuery.isFetching,
        vaporizeUser,
        updateModifiers,
    };
};
