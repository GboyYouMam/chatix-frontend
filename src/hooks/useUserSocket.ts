import { useEffect } from 'react';
import { api } from '../api/client.ts';
import type { User } from '../api/auth/types.ts';
import { queryClient } from '../lib/queryClient.ts';
import { createSocket } from '../lib/socket.ts';
import { useAuthStore } from '../store/authStore.ts';

export function useUserSocket() {
    const token = useAuthStore((state) => state.token);
    const ban = useAuthStore((state) => state.ban);
    useEffect(() => {
        if (!token || ban) return;
        const socket = createSocket('/');
        const refresh = async () => {
            await queryClient.invalidateQueries({ queryKey: ['me'] });
            const { data } = await api.get<User>('/users/me');
            useAuthStore.getState().setUser(data);
        };
        socket.on('user:updated', refresh);
        socket.on('user:banned', (ban: { bannedUntil: string | null; banReason: string | null }) =>
            useAuthStore.getState().setBan(ban),
        );
        return () => {
            socket.disconnect();
        };
    }, [token, ban]);
}
