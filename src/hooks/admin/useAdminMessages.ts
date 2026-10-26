import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '../../lib/toast';
import type { AdminMessage } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';
import { adminApi } from '../../api/admin/admin.service.ts';
import { adminKeys } from './adminKeys.ts';

export const useAdminMessages = ({
    page,
    limit = 25,
    search,
    enabled = true,
}: AdminListOptions) => {
    const queryClient = useQueryClient();
    const listParams = { page, limit, search };

    const messagesQuery = useQuery({
        queryKey: adminKeys.messages(listParams),
        queryFn: () => getPaginated<AdminMessage>('/admin/messages', listParams),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 10_000,
    });

    const invalidateMessages = () =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'messages', 'list'] });
    const invalidateAuditLogs = () =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });

    const deleteMessage = useMutation({
        mutationFn: (messageId: string) => adminApi.deleteMessage(messageId),
        onSuccess: async () => {
            notify.success('message deleted.');
            await Promise.all([invalidateMessages(), invalidateAuditLogs()]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'Failed to delete message')),
    });

    return {
        items: messagesQuery.data?.items ?? [],
        total: messagesQuery.data?.pagination.total ?? 0,
        isInitialLoading: messagesQuery.isLoading,
        messages: messagesQuery.data?.items ?? [],
        pagination: messagesQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: messagesQuery.isLoading,
        isFetching: messagesQuery.isFetching,
        deleteMessage,
    };
};
