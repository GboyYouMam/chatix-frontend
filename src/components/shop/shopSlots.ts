import type { ShopEquipped, ShopEquipSlot } from '../../api/shop/types.ts';

export const STICKER_SLOTS: ShopEquipSlot[] = ['sticker1', 'sticker2', 'sticker3'];

const SLOT_BY_PREFIX: Array<[prefix: string, slot: ShopEquipSlot]> = [
    ['accent_', 'accent'],
    ['bg_', 'background'],
    ['title_', 'title'],
    ['namecolor_', 'nameColor'],
    ['nameicon_', 'nameIcon'],
    ['quote_', 'quoteStyle'],
];

export const slotForItemKey = (key: string): ShopEquipSlot | null => {
    if (key === 'nyan_cat') return 'nyanCat';
    if (key === 'verified_chud') return 'verified';
    if (key.startsWith('sticker_')) return 'sticker1';
    const match = SLOT_BY_PREFIX.find(([prefix]) => key.startsWith(prefix));
    return match ? match[1] : null;
};

const sameValue = (equipped: string | null | undefined, key: string, prefix: string) =>
    equipped === key || equipped === key.slice(prefix.length);

export const isItemEquipped = (equipped: ShopEquipped, key: string): boolean => {
    if (key === 'nyan_cat') return equipped.nyanCat;
    if (key === 'verified_chud') return equipped.verified;
    if (key.startsWith('sticker_')) return equipped.stickers.includes(key);
    if (key.startsWith('accent_')) return sameValue(equipped.accent, key, 'accent_');
    if (key.startsWith('namecolor_')) return sameValue(equipped.nameColor, key, 'namecolor_');
    if (key.startsWith('bg_')) return equipped.background === key;
    if (key.startsWith('title_')) return equipped.title === key;
    if (key.startsWith('nameicon_')) return equipped.nameIcon === key;
    if (key.startsWith('quote_')) return equipped.quoteStyle === key;
    return false;
};
