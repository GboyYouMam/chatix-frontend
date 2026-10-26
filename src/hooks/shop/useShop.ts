import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '../../api/shop/shop.service.ts';
import type { ShopEquipSlot, ShopMe } from '../../api/shop/types.ts';
import { parseApiError } from '../../api/errors.ts';
import { queryKeys } from '../../lib/queryKeys.ts';
import { notify } from '../../lib/toast.ts';
import {
    equipErrorMessage,
    formatAmount,
    purchaseErrorMessage,
} from '../../components/shop/shopFormat.ts';
import { useAuthStore } from '../../store/authStore.ts';

const FIVE_MINUTES = 5 * 60 * 1000;

export const useShopCatalog = () =>
    useQuery({
        queryKey: queryKeys.shopCatalog(),
        queryFn: shopApi.getCatalog,
        staleTime: FIVE_MINUTES,
    });

export const useShopMe = () => {
    const token = useAuthStore((state) => state.token);
    return useQuery({
        queryKey: queryKeys.shopMe(),
        queryFn: shopApi.getMe,
        enabled: Boolean(token),
    });
};

export const useShopPurchase = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemKey: string) => shopApi.purchase(itemKey),
        onSuccess: (response) => {
            queryClient.setQueryData<ShopMe>(queryKeys.shopMe(), (previous) =>
                previous
                    ? { ...previous, aura: response.aura, inventory: response.inventory }
                    : previous,
            );
            const { user, setUser } = useAuthStore.getState();
            if (user) setUser({ ...user, aura: response.aura });
            if (response.refunded) {
                notify.info(
                    `dupe soap. ${formatAmount(response.refunded)} aura refunded. less mid.`,
                    `refund-${response.refunded}`,
                );
            }
        },
        onError: (error) => {
            const { code, message } = parseApiError(error);
            if (code === 'ALREADY_OWNED') {
                void queryClient.invalidateQueries({ queryKey: queryKeys.shopMe() });
            }
            notify.error(purchaseErrorMessage(code) ?? message);
        },
    });
};

export const useShopEquip = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ slot, itemKey }: { slot: ShopEquipSlot; itemKey: string | null }) =>
            shopApi.equip(slot, itemKey),
        onSuccess: (response) => {
            queryClient.setQueryData<ShopMe>(queryKeys.shopMe(), (previous) =>
                previous ? { ...previous, equipped: response.equipped } : previous,
            );
            void queryClient.invalidateQueries({ queryKey: ['profile'] });
        },
        onError: (error) => {
            const { code, message } = parseApiError(error);
            notify.error(equipErrorMessage(code) ?? message);
        },
    });
};
