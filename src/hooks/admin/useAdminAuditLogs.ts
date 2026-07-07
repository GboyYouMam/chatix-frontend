import { useQuery } from '@tanstack/react-query';
import type { AdminAuditLog } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getPaginated,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';

export const useAdminAuditLogs = ({
    page,
    limit = 25,
    search,
    enabled = true,
}: AdminListOptions) => {
    const listParams = { page, limit, search };

    const auditLogsQuery = useQuery({
        queryKey: ['admin', 'audit-logs', listParams],
        queryFn: () => getPaginated<AdminAuditLog>('/admin/audit-logs', listParams),
        enabled,
    });

    return {
        auditLogs: auditLogsQuery.data?.items ?? [],
        pagination: auditLogsQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: auditLogsQuery.isLoading,
        isFetching: auditLogsQuery.isFetching,
    };
};
