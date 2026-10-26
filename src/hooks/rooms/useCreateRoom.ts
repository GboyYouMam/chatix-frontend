import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { notify } from '../../lib/toast';
import type { CreateRoomDTO } from "../../api/rooms/types.ts";


export const useCreateRoom = () => {
    const queryClient = useQueryClient();

    const createRoom = useMutation({
        mutationFn: (data: CreateRoomDTO) => roomApi.createRoom(data),
        onSuccess: () => {
            notify.success('Room created. Go yap about it.');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
        onError: (error) => {
            notify.error(error);
        }
    });

    return {
        createRoom
    };
}
