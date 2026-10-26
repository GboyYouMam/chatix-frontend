export type AchievementCategory =
    'aura' | 'debt' | 'fight' | 'rooms' | 'social' | 'moderation' | 'secret';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'shame' | 'secret';

export interface AchievementDef {
    key: string;
    name: string;
    description: string;
    category: AchievementCategory;
    tier: AchievementTier;
    icon: string;
    unlockedPercent: number;
}

export interface UnlockedAchievement {
    key: string;
    unlockedAt: string;
}

const tierOrder: Record<AchievementTier, number> = {
    gold: 0,
    silver: 1,
    bronze: 2,
    secret: 3,
    shame: 4,
};

const palettes: Record<AchievementCategory, string[]> = {
    aura: ['#fa4d98', '#f9a8d4', '#7c3aed'],
    debt: ['#a1a1aa', '#52525b', '#fa4d98'],
    fight: ['#ef4444', '#7f1d1d', '#fa4d98'],
    rooms: ['#8b5cf6', '#c4b5fd', '#fa4d98'],
    social: ['#ec4899', '#f9a8d4', '#7c3aed'],
    moderation: ['#71717a', '#27272a', '#ef4444'],
    secret: ['#fa4d98', '#8b5cf6', '#22d3ee'],
};

const neutralPalette = ['#71717a', '#3f3f46', '#a1a1aa'];

export function sortForRack(
    unlocked: UnlockedAchievement[],
    catalog: AchievementDef[],
): AchievementDef[] {
    const dates = new Map(unlocked.map(({ key, unlockedAt }) => [key, unlockedAt]));
    return catalog
        .filter(({ key }) => dates.has(key))
        .sort(
            (a, b) =>
                tierOrder[a.tier] - tierOrder[b.tier] ||
                Date.parse(dates.get(a.key)!) - Date.parse(dates.get(b.key)!),
        );
}

export function ribbonStyle(def: Pick<AchievementDef, 'category' | 'tier'>) {
    // Unknown categories (e.g. one added on the backend before the frontend) fall back to neutral.
    const stripes: string[] = palettes[def.category] ?? neutralPalette;
    const gradient =
        def.tier === 'shame'
            ? 'linear-gradient(90deg, #09090b 0 33%, #7f1d1d 33% 66%, #09090b 66%)'
            : def.tier === 'secret'
              ? `linear-gradient(90deg, ${stripes.join(', ')})`
              : `repeating-linear-gradient(90deg, ${stripes.join(', ')})`;
    return {
        stripes,
        border:
            def.tier === 'gold'
                ? '#facc15'
                : def.tier === 'silver'
                  ? '#d4d4d8'
                  : def.tier === 'shame'
                    ? '#ef4444'
                    : def.tier === 'secret'
                      ? '#22d3ee'
                      : '#b45309',
        background: gradient,
    };
}
