import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AdminAuditLog } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getPaginated,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';
import { adminKeys } from './adminKeys.ts';

export const useAdminAuditLogs = ({
    page,
    limit = 25,
    search,
    enabled = true,
}: AdminListOptions) => {
    const listParams = { page, limit, search };

    const auditLogsQuery = useQuery({
        queryKey: adminKeys.auditLogs(listParams),
        queryFn: () => getPaginated<AdminAuditLog>('/admin/audit-logs', listParams),
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
