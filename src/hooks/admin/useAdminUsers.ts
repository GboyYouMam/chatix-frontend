import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/client.ts';
import type { AdminUser, PaginatedResponse, UpdateModifiersPayload } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';

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
        mutationFn: (userId: string) => api.delete(`/admin/users/${userId}/vaporize`),
        onSuccess: async () => {
            toast.success('User vaporized.');
            await Promise.all([invalidateUsers(), invalidateAuditLogs()]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to vaporize user')),
    });

    const updateModifiers = useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateModifiersPayload }) =>
            api.patch(`/admin/users/${userId}/modifiers`, data),
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

export const useAdminUser = (userId?: string) => {
    const queryClient = useQueryClient();

    const userQuery = useQuery({
        queryKey: ['admin', 'users', userId],
        queryFn: async () => {
            const cachedUser = queryClient
                .getQueriesData<PaginatedResponse<AdminUser>>({ queryKey: ['admin', 'users'] })
                .flatMap(([, data]) => data?.items ?? [])
                .find((user) => user.id === userId);

            if (cachedUser) return cachedUser;

            const response = await getPaginated<AdminUser>('/admin/users', {
                page: 1,
                limit: 1,
                search: userId ?? '',
            });
            const foundUser = response.items.find((user) => user.id === userId) ?? response.items[0];

            if (!foundUser) {
                throw new Error('User was not found');
            }

            return foundUser;
        },
        enabled: Boolean(userId),
    });

    return {
        user: userQuery.data ?? null,
        isLoading: userQuery.isLoading,
        isFetching: userQuery.isFetching,
        isError: userQuery.isError,
    };
};
