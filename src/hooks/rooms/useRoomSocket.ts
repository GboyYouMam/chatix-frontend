import { useCallback, useEffect, useState } from 'react';
import { createSocket } from '../../lib/socket.ts';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '../../lib/toast.ts';
import type { MessageData, MessagePage } from '../../api/messages/types.ts';
import type { InfiniteData } from '@tanstack/react-query';
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
    const [socketError, setSocketError] = useState<string | null>(null);

    useEffect(() => {
        if (!roomId) return;

        const newSocket = createSocket('/');

        const showSocketError = (error: unknown) => {
            setSocketError(getSocketErrorMessage(error) || 'Socket error. Try again.');
        };

        const showErrorMessage = (payload: SocketErrorPayload) => showSocketError(payload);

        newSocket.emit('joinRoom', roomId);

        newSocket.on('connect_error', showSocketError);
        newSocket.on('error', showSocketError);
        newSocket.on('exception', showSocketError);
        newSocket.on('errorMessage', showErrorMessage);

        newSocket.on('newMessage', (msg: MessageData) => {
            queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(['messages', roomId], (old) => {
                if (!old || old.pages.some((page) => page.items.some((item) => item.id === msg.id))) return old;
                return { ...old, pages: [{ ...old.pages[0], items: [...old.pages[0].items, msg] }, ...old.pages.slice(1)] };
            });
        });
        newSocket.on('messageDeleted', ({ id }: { id: string }) => queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(['messages', roomId], (old) => old && ({ ...old, pages: old.pages.map((page) => ({ ...page, items: page.items.filter((message) => message.id !== id) })) })));
        newSocket.on('roomQuarantined', ({ roomId: affectedRoomId, quarantined }: { roomId: string; quarantined: boolean }) => {
            if (affectedRoomId === roomId) {
                if (quarantined) notify.info('this room got quarantined. read-only now.');
                queryClient.invalidateQueries({ queryKey: ['room', roomId] });
            }
        });

        return () => {
            newSocket.off('connect_error', showSocketError);
            newSocket.off('error', showSocketError);
            newSocket.off('exception', showSocketError);
            newSocket.off('errorMessage', showErrorMessage);
            newSocket.disconnect();
        };
    }, [roomId, queryClient]);

    const sendMessage = useCallback(async (payload: SendMessagePayload) => {
        const message = await messagesApi.sendMessage({ roomId: payload.roomId, cipherText: payload.text, attachments: payload.attachments });
        queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(['messages', payload.roomId], (old) => old && (old.pages.some((page) => page.items.some((item) => item.id === message.id)) ? old : { ...old, pages: [{ ...old.pages[0], items: [...old.pages[0].items, message] }, ...old.pages.slice(1)] }));
    }, [queryClient]);

    const clearSocketError = useCallback(() => setSocketError(null), []);

    return { sendMessage, socketError, clearSocketError };
};
