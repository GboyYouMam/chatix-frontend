import type { ShopEquipped, ShopEquipSlot } from '../../api/shop/types.ts';

const SLOT_BY_PREFIX: Array<[prefix: string, slot: ShopEquipSlot]> = [
    ['accent_', 'accent'],
    ['bg_', 'background'],
    ['title_', 'title'],
    ['namecolor_', 'nameColor'],
    ['nameicon_', 'nameIcon'],
    ['quote_', 'quoteStyle'],
];

export const slotForItemKey = (key: string): ShopEquipSlot | null => {
    if (key === 'verified_chud') return 'verified';
    const match = SLOT_BY_PREFIX.find(([prefix]) => key.startsWith(prefix));
    return match ? match[1] : null;
};

const sameValue = (equipped: string | null | undefined, key: string, prefix: string) =>
    equipped === key || equipped === key.slice(prefix.length);

export const isItemEquipped = (equipped: ShopEquipped, key: string): boolean => {
    if (key === 'verified_chud') return equipped.verified;
    if (key.startsWith('accent_')) return sameValue(equipped.accent, key, 'accent_');
    if (key.startsWith('namecolor_')) return sameValue(equipped.nameColor, key, 'namecolor_');
    if (key.startsWith('bg_')) return equipped.background === key;
    if (key.startsWith('title_')) return equipped.title === key;
    if (key.startsWith('nameicon_')) return equipped.nameIcon === key;
    if (key.startsWith('quote_')) return equipped.quoteStyle === key;
    return false;
};
