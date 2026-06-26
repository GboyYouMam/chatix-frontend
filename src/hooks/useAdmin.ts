import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import { api } from '../api/client';
import type {
    AdminAuditLog,
    AdminMessage,
    AdminRoom,
    AdminRoomStatus,
    AdminUser,
    AdminWarning,
    PaginatedResponse,
    PaginationMeta,
    UpdateModifiersPayload,
} from '../api/admin/types.ts';

export type AdminTabKey = 'users' | 'rooms' | 'messages' | 'audit-logs';

interface UseAdminOptions {
    activeTab: AdminTabKey;
    page: number;
    limit?: number;
    search: string;
    selectedUserId?: string | null;
    warningsPage: number;
    warningsSearch: string;
}

interface QueryParams {
    page: number;
    limit: number;
    search?: string;
}

const EMPTY_PAGINATION: PaginationMeta = {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
};

function getErrorMessage(error: unknown, fallback: string) {
    if (isAxiosError(error)) {
        const message = error.response?.data?.message;
        if (Array.isArray(message)) return message[0] ?? fallback;
        if (typeof message === 'string') return message;
    }

    return fallback;
}

function cleanParams({ page, limit, search }: QueryParams) {
    const normalizedSearch = search?.trim() ?? '';

    return normalizedSearch
        ? { page, limit, search: normalizedSearch }
        : { page, limit };
}

async function getPaginated<T>(path: string, params: QueryParams) {
    const response = await api.get<PaginatedResponse<T>>(path, {
        params: cleanParams(params),
    });

    return response.data;
}

export const useAdmin = ({
    activeTab,
    page,
    limit = 25,
    search,
    selectedUserId,
    warningsPage,
    warningsSearch,
}: UseAdminOptions) => {
    const queryClient = useQueryClient();
    const listParams = { page, limit, search };
    const warningsParams = { page: warningsPage, limit: 10, search: warningsSearch };

    const usersQuery = useQuery({
        queryKey: ['admin', 'users', listParams],
        queryFn: () => getPaginated<AdminUser>('/admin/users', listParams),
        enabled: activeTab === 'users',
    });

    const roomsQuery = useQuery({
        queryKey: ['admin', 'rooms', listParams],
        queryFn: () => getPaginated<AdminRoom>('/admin/rooms', listParams),
        enabled: activeTab === 'rooms',
    });

    const messagesQuery = useQuery({
        queryKey: ['admin', 'messages', listParams],
        queryFn: () => getPaginated<AdminMessage>('/admin/messages', listParams),
        enabled: activeTab === 'messages',
    });

    const auditLogsQuery = useQuery({
        queryKey: ['admin', 'audit-logs', listParams],
        queryFn: () => getPaginated<AdminAuditLog>('/admin/audit-logs', listParams),
        enabled: activeTab === 'audit-logs',
    });

    const warningsQuery = useQuery({
        queryKey: ['admin', 'warnings', selectedUserId, warningsParams],
        queryFn: () => getPaginated<AdminWarning>(`/admin/users/${selectedUserId}/warnings`, warningsParams),
        enabled: Boolean(selectedUserId),
    });

    const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    const invalidateRooms = () => queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
    const invalidateMessages = () => queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
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

    const quarantineRoom = useMutation({
        mutationFn: ({ roomId, reason }: { roomId: string; reason: string }) =>
            api.patch(`/admin/rooms/${roomId}/quarantine`, { reason }),
        onSuccess: async () => {
            toast.success('Room quarantined.');
            await Promise.all([invalidateRooms(), invalidateAuditLogs()]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to quarantine room')),
    });

    const unquarantineRoom = useMutation({
        mutationFn: (roomId: string) => api.patch(`/admin/rooms/${roomId}/unquarantine`),
        onSuccess: async () => {
            toast.success('Room unquarantined.');
            await Promise.all([invalidateRooms(), invalidateAuditLogs()]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to unquarantine room')),
    });

    const setRoomStatus = useMutation({
        mutationFn: ({ roomId, status }: { roomId: string; status: AdminRoomStatus }) =>
            api.patch(`/rooms/${roomId}/status`, { status }),
        onSuccess: async () => {
            toast.success('Room status updated.');
            await Promise.all([invalidateRooms(), invalidateAuditLogs()]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to update room status')),
    });

    const deleteMessage = useMutation({
        mutationFn: (messageId: string) => api.delete(`/admin/messages/${messageId}`),
        onSuccess: async () => {
            toast.success('Message deleted.');
            await Promise.all([invalidateMessages(), invalidateAuditLogs()]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to delete message')),
    });

    const addWarning = useMutation({
        mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
            api.post(`/admin/users/${userId}/warnings`, { reason }),
        onSuccess: async (_, variables) => {
            toast.success('Warning added.');
            await Promise.all([
                invalidateUsers(),
                invalidateWarnings(variables.userId),
                invalidateAuditLogs(),
            ]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to add warning')),
    });

    const revokeWarning = useMutation({
        mutationFn: ({ userId, warningId }: { userId: string; warningId: string }) =>
            api.delete(`/admin/users/${userId}/warnings/${warningId}`),
        onSuccess: async (_, variables) => {
            toast.success('Warning revoked.');
            await Promise.all([
                invalidateUsers(),
                invalidateWarnings(variables.userId),
                invalidateAuditLogs(),
            ]);
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Failed to revoke warning')),
    });

    const listQuery = (() => {
        switch (activeTab) {
            case 'users':
                return usersQuery;
            case 'rooms':
                return roomsQuery;
            case 'messages':
                return messagesQuery;
            case 'audit-logs':
                return auditLogsQuery;
        }
    })();

    return {
        users: usersQuery.data?.items ?? [],
        rooms: roomsQuery.data?.items ?? [],
        messages: messagesQuery.data?.items ?? [],
        auditLogs: auditLogsQuery.data?.items ?? [],
        currentItems: listQuery.data?.items ?? [],
        pagination: listQuery.data?.pagination ?? EMPTY_PAGINATION,
        warnings: warningsQuery.data?.items ?? [],
        warningsPagination: warningsQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: listQuery.isLoading,
        isFetching: listQuery.isFetching,
        warningsLoading: warningsQuery.isLoading,
        vaporizeUser,
        updateModifiers,
        quarantineRoom,
        unquarantineRoom,
        setRoomStatus,
        deleteMessage,
        addWarning,
        revokeWarning,
    };
};
