import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import toast from 'react-hot-toast';
import type { UpdateRoomDTO } from "../../api/rooms/types.ts";

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const updateRoom = useMutation({
        mutationFn: ({ roomId, data }: { roomId: string; data: UpdateRoomDTO }) =>
            roomApi.updateRoom(roomId, data),

        onSuccess: (_, variables) => {
            toast.success('Room updated successfully');
            queryClient.invalidateQueries({ queryKey: ['room', variables.roomId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'nah something went wrong.');
        }
    });

    const deleteRoom = useMutation({
        mutationFn: ({ roomId }: { roomId: string; }) => roomApi.deleteRoom(roomId),
        onSuccess: () => {
            toast.success('Room ERASED by KILLSQUAD.');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            navigate('/rooms');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to nuke room.');
        }
    });

    return {
        updateRoom,
        deleteRoom,
    };
}