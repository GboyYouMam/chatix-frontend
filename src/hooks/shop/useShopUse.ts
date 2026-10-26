import { useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../../api/shop/shop.service.ts';
import type { ShopMe, ShopUseBody } from '../../api/shop/types.ts';
import { parseApiError } from '../../api/errors.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { notify } from '../../lib/toast.ts';
import { useAuthStore } from '../../store/authStore.ts';
import { errorCopyFor, successCopyFor } from '../../components/rooms/roomPerks.ts';

interface UseItemVariables extends ShopUseBody {
    targetName?: string;
}

export const useShopUse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ itemKey, targetUserId, roomId, messageId }: UseItemVariables) =>
            shopApi.use({ itemKey, targetUserId, roomId, messageId }),
        onSuccess: (response, variables) => {
            queryClient.setQueryData<ShopMe>(queryKeys.shopMe(), (previous) =>
                previous
                    ? {
                          ...previous,
                          aura: response.aura ?? previous.aura,
                          inventory: response.inventory ?? previous.inventory,
                      }
                    : previous,
            );
            if (typeof response.aura === 'number') {
                const { user, setUser } = useAuthStore.getState();
                if (user) setUser({ ...user, aura: response.aura });
            }
            notify.success(successCopyFor(variables.itemKey, variables.targetName));
            void queryClient.invalidateQueries({ queryKey: queryKeys.shopMe() });
            void queryClient.invalidateQueries({ queryKey: ['profile'] });
            if (variables.roomId) {
                void queryClient.invalidateQueries({ queryKey: queryKeys.room(variables.roomId) });
                void queryClient.invalidateQueries({ queryKey: queryKeys.rooms() });
            }
            if (variables.messageId && variables.roomId) {
                void queryClient.invalidateQueries({
                    queryKey: queryKeys.messages(variables.roomId),
                });
            }
        },
        onError: (error) => {
            const { code, message } = parseApiError(error);
            notify.error(errorCopyFor(code) ?? message);
        },
    });
};
