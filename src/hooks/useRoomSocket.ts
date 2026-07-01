import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const RoomSocketEvent = {
    sendMessage: 'sendMessage',
    newMessage: 'newMessage',
    joinRoom: 'joinRoom',
    leaveRoom: 'leaveRoom'
} as const;

export const useRoomSocket = (roomId: string | undefined) => {
    const queryClient = useQueryClient();
    const { user, token } = useAuthStore();

    const [socket] = useState<Socket>(() => io(import.meta.env.VITE_API_URL, {
        auth: {
            token: `Bearer ${token}`
        }
    }));

    useEffect(() => {
        if (!roomId) return;

        socket.emit(RoomSocketEvent.joinRoom, roomId);

        const handleNewMessage = (msg: any) => {
            queryClient.setQueryData(['messages', roomId], (oldData: any[]) => {
                if (!oldData) return [msg];
                if (oldData.some(m => m.id === msg.id)) return oldData;

                const fixedMsg = { ...msg };
                if (!fixedMsg.author && fixedMsg.authorId === user?.id) {
                    fixedMsg.author = { username: user?.username };
                }

                return [...oldData, fixedMsg];
            });
        };

        socket.on(RoomSocketEvent.newMessage, handleNewMessage);

        return () => {
            socket.off(RoomSocketEvent.newMessage, handleNewMessage);
            socket.emit(RoomSocketEvent.leaveRoom, roomId);
        };
    }, [roomId, queryClient, user, socket]);

    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return { socket };
};