import type { AchievementDef } from './ribbons.ts';

export type MedalShape =
    'star' | 'shield' | 'cross' | 'laurel' | 'heart' | 'broken' | 'eye' | 'blank';

export interface MedalStyle {
    ribbonStripes: string[];
    metal: string;
    shape: MedalShape;
    holo: boolean;
}

const palettes: Record<AchievementDef['category'], string[]> = {
    aura: ['#fa4d98', '#f9a8d4', '#7c3aed'],
    debt: ['#a1a1aa', '#52525b', '#fa4d98'],
    fight: ['#ef4444', '#7f1d1d', '#fa4d98'],
    rooms: ['#8b5cf6', '#c4b5fd', '#fa4d98'],
    social: ['#ec4899', '#f9a8d4', '#7c3aed'],
    moderation: ['#71717a', '#27272a', '#ef4444'],
    secret: ['#fa4d98', '#8b5cf6', '#22d3ee'],
};

export const neutralPalette = ['#71717a', '#3f3f46', '#a1a1aa'];

const METALS: Record<AchievementDef['tier'], string> = {
    bronze: '#b0793a',
    silver: '#c9ced6',
    gold: '#e7c35a',
    shame: '#1c1c20',
    secret: '#c084fc',
};

const ICON_TO_SHAPE: Record<string, MedalShape> = {
    star: 'star',
    shield: 'shield',
    cross: 'cross',
    laurel: 'laurel',
    heart: 'heart',
    broken: 'broken',
    eye: 'eye',
};

// Ribbon stripes follow the category palette. Unknown categories fall back to neutral.
export function ribbonStripes(def: Pick<AchievementDef, 'category'>): string[] {
    return palettes[def.category] ?? neutralPalette;
}

// Unknown or missing icon keys fall back to the star, the plainest US-style decoration.
export function medalShape(icon: string | null | undefined): MedalShape {
    return (icon && ICON_TO_SHAPE[icon]) || 'star';
}

export function medalStyle(def: Pick<AchievementDef, 'category' | 'tier' | 'icon'>): MedalStyle {
    return {
        ribbonStripes: ribbonStripes(def),
        metal: METALS[def.tier] ?? METALS.bronze,
        shape: medalShape(def.icon),
        holo: def.tier === 'secret',
    };
}

// Mixes a #rrggbb colour toward white (amount > 0) or black (amount < 0), for bevel highlights and shadows.
export function shadeHex(hex: string, amount: number): string {
    const value = hex.replace('#', '');
    const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
    const target = amount >= 0 ? 255 : 0;
    const weight = Math.min(1, Math.abs(amount));
    return `#${channels
        .map((channel) =>
            Math.round(channel + (target - channel) * weight)
                .toString(16)
                .padStart(2, '0'),
        )
        .join('')}`;
}
