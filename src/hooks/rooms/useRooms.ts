import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/rooms/rooms.service.ts';
import toast from 'react-hot-toast';
import { api } from "../../api/client.ts";

export const useRooms = () => {
    const navigate = useNavigate();

    const joinRoom = useMutation({
        mutationFn: ({ roomId, password }: { roomId: string; password: string }) =>
            api.post(`/rooms/${roomId}/join`, { password }),
        onSuccess: (_, variables) => {
            toast.success('ACCESS GRANTED.');
            navigate(`/room/${variables.roomId}`);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Access Denied.');
        }
    });

    const searchRoomByName = useMutation({
        mutationFn: (roomName: string) => roomApi.findRoomByName(roomName),
        onSuccess: (data) => {
            console.log(data);
            toast.success('Room found! U dam lucky');
            navigate(`/room/${data.data.id}`);
        },
        onError: () => {
            toast.error('Room not found. Maybe it got nuked? Or u just spell it wrong');
        }
    });

    return {
        joinRoom,
        searchRoomByName,
    };
}