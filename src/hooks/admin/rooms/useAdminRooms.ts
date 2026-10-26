import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notify } from '../../../lib/toast';
import type { AdminRoom, AdminRoomStatus } from '../../../api/admin/types.ts';
import {
    EMPTY_PAGINATION,
    getErrorMessage,
    getPaginated,
    type AdminListOptions,
} from '../../../utils/adminQueryUtils.ts';
import { roomApi } from '../../../api/rooms/rooms.service.ts';
import { adminKeys } from '../adminKeys.ts';

export const useAdminRooms = ({ page, limit = 25, search, enabled = true }: AdminListOptions) => {
    const queryClient = useQueryClient();
    const listParams = { page, limit, search };

    const roomsQuery = useQuery({
        queryKey: adminKeys.rooms(listParams),
        queryFn: () => getPaginated<AdminRoom>('/admin/rooms', listParams),
        enabled,
        placeholderData: keepPreviousData,
        staleTime: 10_000,
    });

    const invalidateRooms = () =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'rooms', 'list'] });
    const invalidateAuditLogs = () =>
        queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });

    const quarantineRoom = useMutation({
        mutationFn: ({ roomId, reason }: { roomId: string; reason: string }) =>
            roomApi.qurantineRoom(roomId, reason),
        onSuccess: async (room, variables) => {
            notify.success('room quarantined.');
            queryClient.setQueryData(adminKeys.room(variables.roomId), room);
            await Promise.all([invalidateRooms(), invalidateAuditLogs()]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'Failed to quarantine room')),
    });

    const unquarantineRoom = useMutation({
        mutationFn: (roomId: string) => roomApi.unquarantineRoom(roomId),
        onSuccess: async (room, roomId) => {
            notify.success('room unquarantined.');
            queryClient.setQueryData(adminKeys.room(roomId), room);
            await Promise.all([invalidateRooms(), invalidateAuditLogs()]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'Failed to unquarantine room')),
    });

    const setRoomStatus = useMutation({
        mutationFn: ({ roomId, status }: { roomId: string; status: AdminRoomStatus }) =>
            roomApi.patchRoomStatus(roomId, status),
        onSuccess: async (room, variables) => {
            notify.success('room status updated.');
            queryClient.setQueryData(adminKeys.room(variables.roomId), room);
            await Promise.all([invalidateRooms(), invalidateAuditLogs()]);
        },
        onError: (error) => notify.error(getErrorMessage(error, 'Failed to update room status')),
    });

    return {
        items: roomsQuery.data?.items ?? [],
        total: roomsQuery.data?.pagination.total ?? 0,
        isInitialLoading: roomsQuery.isLoading,
        rooms: roomsQuery.data?.items ?? [],
        pagination: roomsQuery.data?.pagination ?? EMPTY_PAGINATION,
        isLoading: roomsQuery.isLoading,
        isFetching: roomsQuery.isFetching,
        quarantineRoom,
        unquarantineRoom,
        setRoomStatus,
    };
};
