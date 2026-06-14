import { api } from './client.ts';
import { type AuthResponse, type User } from '../types';

export const authService = {
    login: async (credentials: Record<'username' | 'password', string>): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        return data;
    },

    register: async (credentials: Record<'username' | 'password', string>): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/register', credentials);
        return data;
    },

    getMe: async (): Promise<User> => {
        const { data } = await api.get<User>('/users/me');
        return data;
    },
};