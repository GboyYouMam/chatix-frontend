import { useEffect } from 'react';
import { authService } from '../api/auth/auth.service.ts';
import { useAuthStore } from '../store/authStore.ts';
import { reportAppealDenial } from '../api/achievements/achievements.service.ts';

export function useSessionBootstrap() {
    useEffect(() => {
        const { token, setSessionStatus, setUser } = useAuthStore.getState();
        if (!token) {
            setSessionStatus('ready');
            return;
        }
        setSessionStatus('checking');
        authService
            .getMe()
            .then((user) => {
                setUser(user);
                void reportAppealDenial().catch(() => undefined);
            })
            .catch(() => useAuthStore.setState({ user: null }))
            .finally(() => setSessionStatus('ready'));
    }, []);
}
