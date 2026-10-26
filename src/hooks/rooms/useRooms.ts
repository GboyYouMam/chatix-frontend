import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import { notify } from '../../lib/toast';
import { PATH } from '../../utils/pathList.ts';

export const useRooms = () => {
    const navigate = useNavigate();

    const joinRoom = useMutation({
        mutationFn: ({ roomId, password }: { roomId: string; password: string }) =>
            roomApi.joinRoom(roomId, password),
        onSuccess: (_, variables) => {
            notify.success('ACCESS GRANTED.');
            navigate(PATH.rooms.href.room(variables.roomId));
        },
        onError: (error) => {
            notify.error(error);
        },
    });

    const searchRoomByName = useMutation({
        mutationFn: (roomName: string) => roomApi.findRoomByName(roomName),
        onSuccess: (data) => {
            if (data.publicity === 'private') {
                notify.info('private. know the password or leave.');
                navigate(PATH.rooms.href.joinRoom(data.id));
            } else {
                notify.success('room found. u got lucky.');
                navigate(PATH.rooms.href.room(data.id));
            }
        },
        onError: () => {
            notify.error('Room not found. Maybe it got nuked? Or u just spell it wrong');
        },
    });

    return {
        joinRoom,
        searchRoomByName,
    };
};
