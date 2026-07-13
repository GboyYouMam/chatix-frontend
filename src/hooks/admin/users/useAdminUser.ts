import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminUser, PaginatedResponse } from '../../../api/admin/types.ts';
import { getPaginated } from '../../../utils/adminQueryUtils.ts';

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
            const foundUser =
                response.items.find((user) => user.id === userId) ?? response.items[0];

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
