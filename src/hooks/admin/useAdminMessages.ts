import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/client.ts';
import type { AdminMessage } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';

export const useAdminMessages = ({
    page,
    limit = 25,
    search,
    enabled = true,
}: AdminListOptions) => {
    const queryClient = useQueryClient();
    const listParams = { page, limit, search };

    const messagesQuery = useQuery({
        queryKey: ['admin', 'messages', listParams],
        queryFn: () => getPaginated<AdminMessage>('/admin/messages', listParams),
        enabled,
    });

    const invalidateMessages = () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
    const invalidateAuditLogs = () => queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });

    const deleteMessage = useMutation({
        mutationFn: (messageId: string) => api.delete(`/admin/messages/${messageId}`),
        onSuccess: async () => {
            toast.success('Message deleted.');
            await Promise.all([invalidateMessages(), invalidateAuditLogs()]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to delete message')),
    });

    return {
        messages: messagesQuery.data?.items ?? [],
        pagination: messagesQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: messagesQuery.isLoading,
        isFetching: messagesQuery.isFetching,
        deleteMessage,
    };
};
