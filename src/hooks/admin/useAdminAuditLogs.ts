import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AdminAuditLog } from '../../api/admin/types.ts';
import { EMPTY_PAGINATION, type AdminListOptions } from '../../utils/adminQueryUtils.ts';
import { adminKeys } from './adminKeys.ts';
import { api } from '../../api/client.ts';
import type { PaginatedResponse } from '../../api/admin/types.ts';

export interface AdminAuditFilters {
    adminId?: string;
    actionKey?: string;
    targetType?: string;
    success?: boolean;
    from?: string;
    to?: string;
}

export const useAdminAuditLogs = ({
    page,
    limit = 25,
    search,
    filters,
    enabled = true,
}: AdminListOptions & { filters?: AdminAuditFilters }) => {
    const listParams = { page, limit, search, ...filters };

    const auditLogsQuery = useQuery({
        queryKey: adminKeys.auditLogs(listParams),
        queryFn: async () =>
            (
                await api.get<PaginatedResponse<AdminAuditLog>>('/admin/audit-logs', {
                    params: listParams,
                })
            ).data,
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 10_000,
    });

    return {
        items: auditLogsQuery.data?.items ?? [],
        total: auditLogsQuery.data?.pagination.total ?? 0,
        isInitialLoading: auditLogsQuery.isLoading,
        auditLogs: auditLogsQuery.data?.items ?? [],
        pagination: auditLogsQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: auditLogsQuery.isLoading,
        isFetching: auditLogsQuery.isFetching,
    };
};
