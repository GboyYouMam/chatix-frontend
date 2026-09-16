import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore.ts';
import type { MessageData } from '../../api/messages/types.ts';
import { messagesApi } from '../../api/messages/messages.service.ts';

type SendMessagePayload = {
    roomId: string;
    text: string;
    attachments: File[];
};

type SocketErrorPayload = {
    message?: string | string[];
};

const getSocketErrorMessage = (error: unknown) => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message?: string | string[] }).message;
        return Array.isArray(message) ? message.join(', ') : message;
    }

    return undefined;
};

export const useRoomSocket = (roomId: string | undefined) => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [socketError, setSocketError] = useState<string | null>(null);
    const userId = user?.id;
    const username = user?.username;

    useEffect(() => {
        if (!roomId) return;

        const newSocket = io(import.meta.env.VITE_API_URL);

        const showSocketError = (error: unknown) => {
            setSocketError(getSocketErrorMessage(error) || 'Socket error. Try again.');
        };

        const showErrorMessage = (payload: SocketErrorPayload) => showSocketError(payload);

        newSocket.emit('joinRoom', roomId);

        newSocket.on('connect_error', showSocketError);
        newSocket.on('error', showSocketError);
        newSocket.on('exception', showSocketError);
        newSocket.on('errorMessage', showErrorMessage);

        newSocket.on('newMessage', (msg: MessageData & { authorId?: string }) => {
            queryClient.setQueryData(['messages', roomId], (oldData: MessageData[] | undefined) => {
                if (!oldData) return [msg];
                if (oldData.some((m) => m.id === msg.id)) return oldData;

                const fixedMsg = { ...msg };
                if (!fixedMsg.author && fixedMsg.authorId === userId) {
                    fixedMsg.author = {
                        username: username ?? 'Anon',
                    };
                }

                return [...oldData, fixedMsg];
            });
        });

        return () => {
            newSocket.off('connect_error', showSocketError);
            newSocket.off('error', showSocketError);
            newSocket.off('exception', showSocketError);
            newSocket.off('errorMessage', showErrorMessage);
            newSocket.disconnect();
        };
    }, [roomId, queryClient, userId, username]);

    const sendMessage = useCallback(
        async (payload: SendMessagePayload) => {
            try {
                const message = await messagesApi.sendMessage({
                    roomId: payload.roomId,
                    cipherText: payload.text,
                    attachments: payload.attachments,
                });
                queryClient.setQueryData(['messages', payload.roomId], (messages: MessageData[] | undefined) =>
                    messages?.some((item) => item.id === message.id) ? messages : [...(messages ?? []), message],
                );
            } catch (error) {
                setSocketError(getSocketErrorMessage(error) || 'Failed to send message.');
                throw error;
            }
        },
        [queryClient],
    );

    const clearSocketError = useCallback(() => setSocketError(null), []);

    return { sendMessage, socketError, clearSocketError };
};
