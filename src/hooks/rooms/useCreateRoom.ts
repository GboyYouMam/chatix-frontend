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
        onSuccess: () => {
            notify.success('room sent to the mods. u have to wait son 😭');
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
                notify.error('locked. buy that theme in the soap market first.');
            else notify.error(error);
        },
    });

    return {
        createRoom,
    };
};
