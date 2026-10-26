import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { notify } from '../../lib/toast';
import type { CreateRoomDTO } from '../../api/rooms/types.ts';

export const useCreateRoom = () => {
    const queryClient = useQueryClient();

    const createRoom = useMutation({
        mutationFn: (data: CreateRoomDTO) => roomApi.createRoom(data),
        onSuccess: () => {
            notify.success('room sent to the mods. u have to wait son 😭');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            queryClient.invalidateQueries({ queryKey: ['myRooms'] });
        },
        onError: (error) => {
            if (
                (error as { response?: { status?: number; data?: { code?: string } } }).response
                    ?.data?.code === 'ROOM_NAME_TAKEN'
            )
                notify.error('this name is taken. be original, chud.');
            else notify.error(error);
        },
    });

    return {
        createRoom,
    };
};
