import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AdminRoom, PaginatedResponse } from '../../../api/admin/types.ts';
import { roomApi } from '../../../api/rooms/rooms.service.ts';

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

            return await roomApi.getRoomDetailed<AdminRoom>(roomId as string);
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
