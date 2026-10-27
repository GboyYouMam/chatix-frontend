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

export const RACK_MAX_DESKTOP = 16;
export const RACK_MAX_COMPACT = 12;
export const RACK_COMPACT_QUERY = '(max-width: 600px)';

// The rack shows at most `max` cells. When medals overflow, the last cell becomes the "+N" chip,
// so the rack never grows past its two rows.
export function visibleRibbons<T>(sorted: T[], max: number): { shown: T[]; hidden: number } {
    if (sorted.length <= max) return { shown: sorted, hidden: 0 };
    const keep = Math.max(0, max - 1);
    return { shown: sorted.slice(0, keep), hidden: sorted.length - keep };
}
