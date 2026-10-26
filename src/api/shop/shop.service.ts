import { api } from '../client.ts';
import type {
    ShopCatalogItem,
    ShopEquipped,
    ShopEquipSlot,
    ShopMe,
    ShopPurchaseResponse,
} from './types.ts';

export const shopApi = {
    getCatalog: async (): Promise<ShopCatalogItem[]> => (await api.get('/shop/catalog')).data,

    getMe: async (): Promise<ShopMe> => (await api.get('/shop/me')).data,

    purchase: async (itemKey: string): Promise<ShopPurchaseResponse> =>
        (await api.post('/shop/purchase', { itemKey })).data,

    equip: async (
        slot: ShopEquipSlot,
        itemKey: string | null,
    ): Promise<{ equipped: ShopEquipped }> =>
        (await api.patch('/shop/equip', { slot, itemKey })).data,
};
