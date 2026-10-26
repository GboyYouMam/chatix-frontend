import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AdminUser } from '../../../api/admin/types.ts';
import { adminKeys } from '../adminKeys.ts';
import {
    EMPTY_PAGINATION,
    getPaginated,
    type AdminListOptions,
} from '../../../utils/adminQueryUtils.ts';

export const useAdminUsers = ({ page, limit = 25, search, enabled = true }: AdminListOptions) => {
    const listParams = { page, limit, search };
    const usersQuery = useQuery({
        queryKey: adminKeys.users(listParams),
        queryFn: () => getPaginated<AdminUser>('/admin/users', listParams),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 10_000,
    });
    const items = usersQuery.data?.items ?? [];

    return {
        items,
        total: usersQuery.data?.pagination.total ?? 0,
        isInitialLoading: usersQuery.isLoading,
        users: items,
        pagination: usersQuery.data?.pagination ?? EMPTY_PAGINATION,
        isFetching: usersQuery.isFetching,
    };
};
