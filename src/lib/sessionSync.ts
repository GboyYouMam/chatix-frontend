import { useAuthStore } from '../store/authStore.ts';
import { queryClient } from './queryClient.ts';

export const shouldLogoutOn401 = (requestToken: string | null, currentToken: string | null) =>
    requestToken !== null && currentToken !== null && requestToken === currentToken;

export const startSessionSync = () => {
    let token = useAuthStore.getState().token;
    const unsubscribe = useAuthStore.subscribe((state) => {
        if (state.token !== token) {
            token = state.token;
            queryClient.clear();
        }
    });
    const onStorage = (event: StorageEvent) => {
        if (event.key === 'chatix-auth') void useAuthStore.persist.rehydrate();
    };
    window.addEventListener('storage', onStorage);
    return () => {
        window.removeEventListener('storage', onStorage);
        unsubscribe();
    };
};
