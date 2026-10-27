import type { ShopCatalogItem } from '../../api/shop/types.ts';
import type { BackgroundPattern } from '../cosmetics/profileCosmetics.ts';
import { resolveAccentColor } from './cosmeticPalette.ts';

export type ShopPreview =
    | { kind: 'swatch'; color: string }
    | { kind: 'glyph'; glyph: string }
    | { kind: 'pattern'; pattern: BackgroundPattern }
    | { kind: 'text'; text: string; variant: 'serif' | 'mono' | 'quote' | 'button' };

// Text glyphs only: classic emoticons and typographic symbols, no emoji.
const GLYPHS: Record<string, string> = {
    nameicon_skull: 'x_x',
    nameicon_soap: 'o',
    nameicon_crown: '♛',
    nameicon_clown: ':o)',
    verified_chud: '√',
    mystery_soap: 'o',
    clown_stamp: ':o)',
    rename_curse: '✦',
    aura_tax: '$',
    spotlight: '★',
    room_boost: '^',
    fight_insurance: '✝',
    debt_forgiveness: '†',
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
    if (key === 'vine_boom') return { kind: 'text', text: '5 BIG BOOMS', variant: 'button' };
    if (key.startsWith('bg_')) {
        return { kind: 'pattern', pattern: key.slice('bg_'.length) as BackgroundPattern };
    }
    return { kind: 'glyph', glyph: GLYPHS[key] ?? '◆' };
};
