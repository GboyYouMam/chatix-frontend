import { useEffect } from 'react';
import { createSocket } from '../lib/socket.ts';
import { useAuthStore } from '../store/authStore.ts';
import { authService } from '../api/auth/auth.service.ts';
import { useQueryClient } from '@tanstack/react-query';
import { achievementsApi } from '../api/achievements/achievements.service.ts';
import { MedalUnlockedToast } from '../components/achievements/MedalUnlockedToast.tsx';
import toast from 'react-hot-toast';
import { createElement } from 'react';

export function useUserSocket() {
    const token = useAuthStore((state) => state.token);
    const ban = useAuthStore((state) => state.ban);
    const queryClient = useQueryClient();
    useEffect(() => {
        if (!token || ban) return;
        const socket = createSocket('/');
        const refresh = async () => {
            try {
                const data = await authService.getMe();
                useAuthStore.getState().setUser(data);
            } catch {
                // The API interceptor handles session expiry and bans.
            }
        };
        socket.on('user:updated', refresh);
        const onAchievementUnlocked = async ({ key }: { key: string }) => {
            void queryClient.invalidateQueries({ queryKey: ['profile'] });
            void queryClient.invalidateQueries({ queryKey: ['achievementCatalog'] });
            try {
                const catalog = await achievementsApi.getCatalog();
                const medal = catalog.find((item) => item.key === key);
                if (!medal) return;
                toast.custom(
                    (t) =>
                        createElement(MedalUnlockedToast, {
                            medal,
                            visible: t.visible,
                            onClose: () => toast.dismiss(t.id),
                        }),
                    { duration: 6000 },
                );
            } catch {
                // The medal is still saved; the next profile load will show it.
            }
        };
        socket.on('achievement:unlocked', onAchievementUnlocked);
        socket.on('user:banned', (ban: { bannedUntil: string | null; banReason: string | null }) =>
            useAuthStore.getState().setBan(ban),
        );
        return () => {
            socket.off('achievement:unlocked', onAchievementUnlocked);
            socket.disconnect();
        };
    }, [token, ban, queryClient]);
}
