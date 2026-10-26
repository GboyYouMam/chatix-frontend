import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notify } from '../lib/toast';
import { authService } from '../api/auth/auth.service.ts';
import { useAuthStore } from '../store/authStore';
import { AxiosError } from 'axios';
import { PATH } from '../utils/pathList.ts';
import { reportAppealDenial } from '../api/achievements/achievements.service.ts';

export const useAuth = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const logoutStore = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: authService.login,
        onSuccess: async (data) => {
            useAuthStore.setState({ token: data.access_token });

            try {
                const user = await authService.getMe();
                setAuth(data.access_token, user);
                void reportAppealDenial().catch(() => undefined);
                notify.success(`welcome back bum ${user.username}!`);
                navigate(PATH.rooms.rooms);
            } catch {
                logoutStore();
                notify.error('failed to load your profile, chud.');
            }
        },
        onError: (
            error: AxiosError<{
                message: string;
                code?: string;
                bannedUntil?: string;
                banReason?: string;
            }>,
        ) => {
            if (error.response?.data.code === 'BANNED') return;
            if (error.response?.status === 401) notify.error('wrong username or password.');
            else if (!error.response || error.response.status >= 500)
                notify.error("can't reach the server. try again, chud.");
            else notify.error(error.response.data?.message || 'login failed, chud.');
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: async (data) => {
            useAuthStore.setState({ token: data.access_token });
            try {
                const user = await authService.getMe();
                setAuth(data.access_token, user);
                void reportAppealDenial().catch(() => undefined);
                notify.success('Ascension complete! Profile created');
                navigate(PATH.rooms.rooms);
            } catch {
                logoutStore();
                notify.error('Registration passed, but profile failed to load.');
            }
        },
        onError: (
            error: AxiosError<{
                message: string | string[];
                code?: string;
                bannedUntil?: string;
                banReason?: string;
            }>,
        ) => {
            if (error.response?.data.code === 'BANNED') return;
            const message = error.response?.data?.message;
            const msg = Array.isArray(message) ? message[0] : message || 'Registration failed';
            notify.error(msg);
        },
    });

    const handleLogout = () => {
        logoutStore();
        queryClient.clear();
        notify.success('Logged out. See ya, chud.');
        navigate(PATH.authAndUser.login);
    };

    return {
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        logout: handleLogout,
    };
};
