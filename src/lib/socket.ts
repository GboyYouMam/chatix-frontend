import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.ts';
import { notify } from './toast.ts';

type SocketErrorPayload = {
    code?: string;
    message?: string;
    bannedUntil?: string;
    banReason?: string;
};

const handleSocketError = (payload: SocketErrorPayload | undefined) => {
    if (!payload) return;
    // The room page turns this into the 18+ confirm screen instead of a toast.
    if (payload.code === 'AGE_GATE') return;
    if (payload.code === 'BANNED') {
        useAuthStore.getState().setBan({
            bannedUntil: payload.bannedUntil ?? null,
            banReason: payload.banReason ?? null,
        });
        return;
    }
    notify.error(payload.message ?? 'socket said no.');
};

export function createSocket(namespace: '/' | '/fight-club' | '/admin'): Socket {
    const url = `${import.meta.env.VITE_API_URL}${namespace === '/' ? '' : namespace}`;
    const socket = io(url, {
        auth: (callback) => callback({ token: useAuthStore.getState().token }),
        transports: ['websocket'],
    });
    // Auth is checked in server middleware, so rejections arrive as connect_error.
    socket.on('connect_error', (error: Error & { data?: SocketErrorPayload }) =>
        handleSocketError(error.data),
    );
    socket.on('exception', handleSocketError);
    return socket;
}
