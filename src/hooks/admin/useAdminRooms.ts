import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/client.ts';
import type { AdminRoom, AdminRoomStatus, PaginatedResponse } from '../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminListOptions,
} from '../../utils/adminQueryUtils.ts';

export const useAdminRooms = ({
    page,
    limit = 25,
    search,
    enabled = true,
}: AdminListOptions) => {
    const queryClient = useQueryClient();
    const listParams = { page, limit, search };

    const roomsQuery = useQuery({
        queryKey: ['admin', 'rooms', listParams],
        queryFn: () => getPaginated<AdminRoom>('/admin/rooms', listParams),
        enabled,
    });

    const invalidateRooms = () => queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
    const invalidateAuditLogs = () => queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });

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

    return {
        rooms: roomsQuery.data?.items ?? [],
        pagination: roomsQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: roomsQuery.isLoading,
        isFetching: roomsQuery.isFetching,
        quarantineRoom,
        unquarantineRoom,
        setRoomStatus,
    };
};

export const useAdminRoom = (roomId?: string) => {
    const queryClient = useQueryClient();

    const roomQuery = useQuery({
        queryKey: ['admin', 'rooms', roomId],
        queryFn: async () => {
            const cachedRoom = queryClient
                .getQueriesData<PaginatedResponse<AdminRoom>>({ queryKey: ['admin', 'rooms'] })
                .flatMap(([, data]) => data?.items ?? [])
                .find((room) => room.id === roomId);

            if (cachedRoom) return cachedRoom;

            const response = await api.get<AdminRoom>(`/rooms/${roomId}`);
            return response.data;
        },
        enabled: Boolean(roomId),
    });

    return {
        room: roomQuery.data ?? null,
        isLoading: roomQuery.isLoading,
        isFetching: roomQuery.isFetching,
        isError: roomQuery.isError,
    };
};
