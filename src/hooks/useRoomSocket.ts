import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const RoomSocketEvent = {
    sendMessage: 'sendMessage',
    newMessage: 'newMessage',
    joinRoom: 'joinRoom'
} as const;

export const useRoomSocket = (roomId: string | undefined) => {
    const queryClient = useQueryClient();
    const { user, token } = useAuthStore();
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const newSocket = io(import.meta.env.VITE_API_URL, {
            auth: {
                token: `Bearer ${token}`
            }
        });
        setSocket(newSocket);

        newSocket.emit(RoomSocketEvent.joinRoom, roomId);

        newSocket.on(RoomSocketEvent.newMessage, (msg) => {
            queryClient.setQueryData(['messages', roomId], (oldData: any[]) => {
                if (!oldData) return [msg];
                if (oldData.some(m => m.id === msg.id)) return oldData;

                const fixedMsg = { ...msg };
                if (!fixedMsg.author && fixedMsg.authorId === user?.id) {
                    fixedMsg.author = {
                        username: user?.username
                    }
                }

                return [...oldData, fixedMsg];
            });
        });

        return () => {
            newSocket.disconnect();
        };
    }, [roomId, queryClient, user]);

    return { socket };
};