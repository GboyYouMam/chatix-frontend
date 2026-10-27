import type { ShopCatalogItem } from '../../api/shop/types.ts';
import type { BackgroundPattern } from '../cosmetics/profileCosmetics.ts';
import { resolveAccentColor } from './cosmeticPalette.ts';

export type ShopPreview =
    | { kind: 'swatch'; color: string }
    | { kind: 'glyph'; glyph: string }
    | { kind: 'pattern'; pattern: BackgroundPattern }
    | { kind: 'text'; text: string; variant: 'serif' | 'mono' | 'quote' | 'button' };

const GLYPHS: Record<string, string> = {
    nameicon_skull: '💀',
    nameicon_soap: '🧼',
    nameicon_crown: '👑',
    nameicon_clown: '🤡',
    verified_chud: '✔',
    mystery_soap: '🧼',
    clown_stamp: '🤡',
    rename_curse: '🪄',
    aura_tax: '🧾',
    spotlight: '🔦',
    room_boost: '🚀',
    fight_insurance: '🛡',
    debt_forgiveness: '🧴',
};

export const previewFor = (item: Pick<ShopCatalogItem, 'key'>): ShopPreview => {
    const { key } = item;
    if (key.startsWith('accent_') || key.startsWith('namecolor_')) {
        return { kind: 'swatch', color: resolveAccentColor(key) };
    }
    if (key.startsWith('title_')) {
        return {
            kind: 'text',
            text: key.slice('title_'.length).replace(/_/g, ' '),
            variant: 'serif',
        };
    }
    if (key.startsWith('theme_')) {
        return {
            kind: 'text',
            text: key.slice('theme_'.length).replace(/_/g, ' '),
            variant: 'serif',
        };
    }
    if (key.startsWith('quote_')) return { kind: 'text', text: '>>420 mogged', variant: 'quote' };
    if (key === 'hit_counter') return { kind: 'text', text: '000420', variant: 'mono' };
    if (key === 'vine_boom') return { kind: 'text', text: 'BOOM', variant: 'button' };
    if (key.startsWith('bg_')) {
        return { kind: 'pattern', pattern: key.slice('bg_'.length) as BackgroundPattern };
    }
    return { kind: 'glyph', glyph: GLYPHS[key] ?? '◆' };
};
