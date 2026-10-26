import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { notify } from '../lib/toast';
import { authService } from '../api/auth/auth.service.ts';
import { useAuthStore } from '../store/authStore';
import { AxiosError } from 'axios';
import { PATH } from '../utils/pathList.ts';

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
                notify.success(`welcome back bum ${user.username}!`);
                navigate(PATH.rooms.rooms);
            } catch {
                logoutStore();
                notify.error('Failed to parse your profile profile.');
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
            if (error.response?.status === 403 && error.response.data.code === 'BANNED') {
                useAuthStore
                    .getState()
                    .setBan({
                        bannedUntil: error.response.data.bannedUntil ?? null,
                        banReason: error.response.data.banReason ?? null,
                    });
                return;
            }
            const msg = error.response?.data?.message || 'Invalid credentials, chud';
            notify.error(msg);
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: async (data) => {
            useAuthStore.setState({ token: data.access_token });
            try {
                const user = await authService.getMe();
                setAuth(data.access_token, user);
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
            if (error.response?.status === 403 && error.response.data.code === 'BANNED') {
                useAuthStore
                    .getState()
                    .setBan({
                        bannedUntil: error.response.data.bannedUntil ?? null,
                        banReason: error.response.data.banReason ?? null,
                    });
                return;
            }
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
