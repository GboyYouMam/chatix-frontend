import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../api/rooms/rooms.service';
import toast from 'react-hot-toast';
import type {CreateRoomDTO, UpdateRoomDTO} from "../api/rooms/types.ts";
import { api } from "../api/client.ts";

export const useRooms = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

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
        createRoom,
        updateRoom,
        deleteRoom,
        joinRoom,
        searchRoomByName,
    };
}