import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { notify } from '../../lib/toast';
import type { UpdateRoomDTO } from '../../api/rooms/types.ts';
import { PATH } from '../../utils/pathList.ts';

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const updateRoom = useMutation({
        mutationFn: ({ roomId, data }: { roomId: string; data: UpdateRoomDTO }) =>
            roomApi.updateRoom(roomId, data),

        onSuccess: (_, variables) => {
            notify.success('Room updated successfully');
            queryClient.invalidateQueries({ queryKey: ['room', variables.roomId] });
        },
        onError: (error) => {
            notify.error(error);
        },
    });

    const deleteRoom = useMutation({
        mutationFn: ({ roomId }: { roomId: string }) => roomApi.deleteRoom(roomId),
        onSuccess: () => {
            notify.success('Room ERASED by KILLSQUAD.');
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            navigate(PATH.rooms.rooms);
        },
        onError: (error) => {
            notify.error(error);
        },
    });

    return {
        updateRoom,
        deleteRoom,
    };
};
