import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { notify } from '../../lib/toast';
import { parseApiError } from '../../api/errors.ts';
import type { UpdateRoomDTO } from '../../api/rooms/types.ts';
import { PATH } from '../../utils/pathList.ts';
import { queryKeys } from '../../lib/queryKeys.ts';

export const useUpdateRoom = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const updateRoom = useMutation({
        mutationFn: ({ roomId, data }: { roomId: string; data: UpdateRoomDTO }) =>
            roomApi.updateRoom(roomId, data),

        onSuccess: (_, variables) => {
            notify.success('Room updated successfully');
            queryClient.invalidateQueries({ queryKey: queryKeys.room(variables.roomId) });
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

    const deleteRoom = useMutation({
        mutationFn: ({ roomId }: { roomId: string }) => roomApi.deleteRoom(roomId),
        onSuccess: () => {
            notify.success('Room ERASED by KILLSQUAD.');
            queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
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
