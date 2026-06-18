import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../api/auth/auth.service.ts';
import { useAuthStore } from '../store/authStore';
import { AxiosError } from 'axios';

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
                toast.success(`welcome back bum ${user.username}!`);
                navigate('/chat');
            } catch (err) {
                logoutStore();
                toast.error('Failed to parse your profile profile.');
            }
        },
        onError: (error: AxiosError<{ message: string }>) => {
            const msg = error.response?.data?.message || 'Invalid credentials, chud';
            toast.error(msg);
        },
    });

    const registerMutation = useMutation({
        mutationFn: authService.register,
        onSuccess: async (data) => {
            useAuthStore.setState({ token: data.access_token });
            try {
                const user = await authService.getMe();
                setAuth(data.access_token, user);
                toast.success('Ascension complete! Profile created');
                navigate('/chat');
            } catch (err) {
                logoutStore();
                toast.error('Registration passed, but profile failed to load.');
            }
        },
        onError: (error: AxiosError<{ message: string | string[] }>) => {
            const message = error.response?.data?.message;
            const msg = Array.isArray(message) ? message[0] : message || 'Registration failed';
            toast.error(msg);
        },
    });

    const handleLogout = () => {
        logoutStore();
        queryClient.clear();
        toast.success('Logged out. See ya, chud.');
        navigate('/login');
    };

    return {
        login: loginMutation.mutate,
        register: registerMutation.mutate,
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        logout: handleLogout
    };
};