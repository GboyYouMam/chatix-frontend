import { api } from '../client.ts';
import { type AuthResponse, type User } from './types.ts';

export const authService = {
    login: async (credentials: Record<'username' | 'password', string>): Promise<AuthResponse> =>
        (await api.post<AuthResponse>('/auth/login', credentials)).data,

    register: async (credentials: Record<'username' | 'password', string>): Promise<AuthResponse> =>
        (await api.post<AuthResponse>('/auth/register', credentials)).data,

    getMe: async (): Promise<User> => (await api.get<User>('/users/me')).data,
};
