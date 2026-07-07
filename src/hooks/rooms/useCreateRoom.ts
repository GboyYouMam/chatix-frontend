import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import toast from 'react-hot-toast';
import type { CreateRoomDTO } from "../../api/rooms/types.ts";


export const useCreateRoom = () => {
    const queryClient = useQueryClient();

    const createRoom = useMutation({
        mutationFn: (data: CreateRoomDTO) => roomApi.createRoom(data),
        onSuccess: () => {
            toast.success('Room created. Go yap about it.');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'nah something went wrong.');
        }
    });

    return {
        createRoom
    };
}