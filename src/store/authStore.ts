import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User } from '../api/auth/types.ts';

interface AuthState {
    token: string | null;
    user: User | null;
    ban: { bannedUntil: string | null; banReason: string | null } | null;
    sessionStatus: 'idle' | 'checking' | 'ready';
    setAuth: (token: string, user: User) => void;
    setUser: (user: User) => void;
    setBan: (ban: AuthState['ban']) => void;
    clearBan: () => void;
    setSessionStatus: (status: AuthState['sessionStatus']) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            ban: null,
            sessionStatus: 'idle',

            setAuth: (token, user) => set({ token, user }),

            setUser: (user) => set({ user }),
            setBan: (ban) => set({ ban }),
            clearBan: () => set({ ban: null }),
            setSessionStatus: (sessionStatus) => set({ sessionStatus }),

            logout: () => set({ token: null, user: null, sessionStatus: 'ready' }),

            isAuthenticated: () => !!get().token,
        }),
        {
            name: 'chatix-auth',

            partialize: (state) => ({ token: state.token, user: state.user, ban: state.ban }),
        },
    ),
);
