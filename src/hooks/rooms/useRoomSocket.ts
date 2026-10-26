import { useCallback, useEffect, useState } from 'react';
import { createSocket } from '../../lib/socket.ts';
import { useQueryClient } from '@tanstack/react-query';
import { notify } from '../../lib/toast.ts';
import type { MessageData, MessagePage } from '../../api/messages/types.ts';
import type { InfiniteData } from '@tanstack/react-query';
import { messagesApi } from '../../api/messages/messages.service.ts';
import { appendMessageToPages, markMessageDeleted } from './messageCache.ts';
import { queryKeys } from '../../lib/queryKeys.ts';

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

        let hasConnected = false;
        const onConnect = () => {
            if (hasConnected)
                queryClient.invalidateQueries({ queryKey: queryKeys.messages(roomId) });
            hasConnected = true;
            newSocket.emit('joinRoom', { roomId });
        };
        newSocket.on('connect', onConnect);

        newSocket.on('connect_error', showSocketError);
        newSocket.on('error', showSocketError);
        newSocket.on('exception', showSocketError);
        newSocket.on('errorMessage', showErrorMessage);

        newSocket.on('newMessage', (msg: MessageData) => {
            queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(
                queryKeys.messages(roomId),
                (old) => appendMessageToPages(old, msg),
            );
        });
        newSocket.on('messageDeleted', ({ id }: { id: string }) =>
            queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(
                queryKeys.messages(roomId),
                (old) => markMessageDeleted(old, id),
            ),
        );
        newSocket.on(
            'roomQuarantined',
            ({ roomId: affectedRoomId, quarantined }: { roomId: string; quarantined: boolean }) => {
                if (affectedRoomId === roomId) {
                    if (quarantined) notify.info('this room got quarantined. read-only now.');
                    queryClient.invalidateQueries({ queryKey: queryKeys.room(roomId) });
                }
            },
        );

        return () => {
            newSocket.off('connect', onConnect);
            newSocket.off('newMessage');
            newSocket.off('messageDeleted');
            newSocket.off('roomQuarantined');
            newSocket.off('connect_error', showSocketError);
            newSocket.off('error', showSocketError);
            newSocket.off('exception', showSocketError);
            newSocket.off('errorMessage', showErrorMessage);
            newSocket.disconnect();
        };
    }, [roomId, queryClient]);

    const sendMessage = useCallback(
        async (payload: SendMessagePayload) => {
            const message = await messagesApi.sendMessage({
                roomId: payload.roomId,
                cipherText: payload.text,
                attachments: payload.attachments,
            });
            queryClient.setQueryData<InfiniteData<MessagePage, string | null>>(
                queryKeys.messages(payload.roomId),
                (old) => appendMessageToPages(old, message),
            );
        },
        [queryClient],
    );

    const clearSocketError = useCallback(() => setSocketError(null), []);

    return { sendMessage, socketError, clearSocketError };
};
