import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { queryClient } from '../lib/queryClient.ts';
import { PATH } from '../utils/pathList.ts';

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout();
            queryClient.clear();
            if (window.location.pathname !== PATH.authAndUser.login) window.location.assign(PATH.authAndUser.login);
        } else if (error.response?.status === 403 && error.response.data?.code === 'BANNED') {
            useAuthStore.getState().setBan({ bannedUntil: error.response.data.bannedUntil ?? null, banReason: error.response.data.banReason ?? null });
        }
        return Promise.reject(error);
    }
);
