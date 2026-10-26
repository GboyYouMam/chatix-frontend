import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '../../lib/toast';
import type { AdminMessage } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';
import { adminApi } from '../../api/admin/admin.service.ts';
import { adminKeys } from './adminKeys.ts';
import { api } from '../../api/client.ts';
import type { PaginatedResponse } from '../../api/admin/types.ts';

export const useAdminMessages = ({
    page,
    limit = 25,
    search,
    room,
    user,
    enabled = true,
}: AdminListOptions & { room?: string; user?: string }) => {
    const queryClient = useQueryClient();
    const listParams = { page, limit, search, room, user };

    const messagesQuery = useQuery({
        queryKey: adminKeys.messages(listParams),
        queryFn: async () =>
            (
                await api.get<PaginatedResponse<AdminMessage>>('/admin/messages', {
                    params: {
                        page,
                        limit,
                        search: search.trim() || undefined,
                        room: room?.trim() || undefined,
                        user: user?.trim() || undefined,
                    },
                })
            ).data,
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
