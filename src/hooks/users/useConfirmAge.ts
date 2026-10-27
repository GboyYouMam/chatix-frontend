import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../../api/users/users.service.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { notify } from '../../lib/toast.ts';

// Confirms the user is 18+. onConfirmed runs from the mutation itself, so it still fires when the
// component that started the request has already unmounted (the room page drops its gate on success).
export const useConfirmAge = (onConfirmed?: () => void) =>
    useMutation({
        mutationFn: () => usersApi.confirmAge(),
        onSuccess: () => {
            const { user, setUser } = useAuthStore.getState();
            if (user) setUser({ ...user, ageConfirmed: true });
            onConfirmed?.();
        },
        onError: (error) => notify.error(error),
    });
