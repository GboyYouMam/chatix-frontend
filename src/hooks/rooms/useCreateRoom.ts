import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { notify } from '../../lib/toast';
import { parseApiError } from '../../api/errors.ts';
import type { CreateRoomDTO } from '../../api/rooms/types.ts';
import { queryKeys } from '../../lib/queryKeys.ts';

export const useCreateRoom = () => {
    const queryClient = useQueryClient();

    const createRoom = useMutation({
        mutationFn: (data: CreateRoomDTO) => roomApi.createRoom(data),
        onSuccess: (room, variables) => {
            if (room.status === 'checkout')
                notify.warn(
                    `our filter got spooked: ${room.statusReason ?? 'no reason given'}. a human will check it.`,
                );
            else notify.success('room is live. go mog.');
            if (room.isNsfw && !variables.isNsfw)
                notify.info("marked 18+ automatically. don't act surprised.", 'auto-18');
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
            queryClient.invalidateQueries({ queryKey: queryKeys.myRooms() });
        },
        onError: (error) => {
            if (
                (error as { response?: { status?: number; data?: { code?: string } } }).response
                    ?.data?.code === 'ROOM_NAME_TAKEN'
            )
                notify.error('this name is taken. be original, chud.');
            else if (parseApiError(error).code === 'THEME_LOCKED')
                notify.error('locked. buy that theme in the laryok shop first.');
            else notify.error(error);
        },
    });

    return {
        createRoom,
    };
};
