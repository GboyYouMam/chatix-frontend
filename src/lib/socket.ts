import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore.ts';
import { notify } from './toast.ts';

export function createSocket(namespace: '/' | '/fight-club' | '/admin'): Socket {
    const url = `${import.meta.env.VITE_API_URL}${namespace === '/' ? '' : namespace}`;
    const socket = io(url, {
        auth: (callback) => callback({ token: useAuthStore.getState().token }),
        transports: ['websocket'],
    });
    socket.on(
        'exception',
        (payload: {
            code?: string;
            message?: string;
            bannedUntil?: string;
            banReason?: string;
        }) => {
            if (payload.code === 'BANNED')
                useAuthStore
                    .getState()
                    .setBan({
                        bannedUntil: payload.bannedUntil ?? null,
                        banReason: payload.banReason ?? null,
                    });
            else notify.error(payload.message ?? payload);
        },
    );
    return socket;
}
