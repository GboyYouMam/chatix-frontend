import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { queryClient } from '../lib/queryClient.ts';
import { PATH } from '../utils/pathList.ts';
import { shouldLogoutOn401 } from '../lib/sessionSync.ts';
import { notify } from '../lib/toast.ts';

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
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const authorization =
                error.config?.headers?.Authorization ?? error.config?.headers?.authorization;
            const requestToken =
                typeof authorization === 'string' ? authorization.replace(/^Bearer\s+/i, '') : null;
            if (shouldLogoutOn401(requestToken, useAuthStore.getState().token)) {
                useAuthStore.getState().logout();
                queryClient.clear();
                notify.error('session ended. log back in, bum.');
                if (window.location.pathname !== PATH.authAndUser.login)
                    window.location.assign(PATH.authAndUser.login);
            }
        } else if (error.response?.status === 403 && error.response.data?.code === 'BANNED') {
            useAuthStore.getState().setBan({
                bannedUntil: error.response.data.bannedUntil ?? null,
                banReason: error.response.data.banReason ?? null,
            });
        }
        return Promise.reject(error);
    },
);
