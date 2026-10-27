export type ShopCategory = 'profile' | 'chat' | 'troll' | 'economy' | 'theme';
export type ShopKind = 'permanent' | 'consumable' | 'timed';
export type ShopRarity = 'common' | 'rare' | 'legendary';

export interface ShopCatalogItem {
    key: string;
    name: string;
    description: string;
    category: ShopCategory;
    kind: ShopKind;
    price: number;
    rarity?: ShopRarity;
    requires?: string | null;
}

export interface ShopInventoryEntry {
    itemKey: string;
    quantity: number;
}

export interface ShopEquipped {
    accent: string | null;
    background: string | null;
    title: string | null;
    nameColor: string | null;
    nameIcon: string | null;
    quoteStyle: string | null;
    verified: boolean;
}

export interface ShopMe {
    aura: number;
    inventory: ShopInventoryEntry[];
    equipped: ShopEquipped;
}

export interface ShopPurchaseResponse {
    aura: number;
    inventory: ShopInventoryEntry[];
    granted?: string;
    refunded?: number;
}

export type ShopEquipSlot =
    'accent' | 'background' | 'title' | 'nameColor' | 'nameIcon' | 'quoteStyle' | 'verified';

export type ShopUseItemKey =
    | 'clown_stamp'
    | 'rename_curse'
    | 'aura_tax'
    | 'spotlight'
    | 'room_boost'
    | 'fight_insurance'
    | 'debt_forgiveness';

export interface ShopUseBody {
    itemKey: ShopUseItemKey;
    targetUserId?: string;
    roomId?: string;
    messageId?: string;
}

export interface ShopUseResponse {
    aura?: number;
    inventory?: ShopInventoryEntry[];
}
