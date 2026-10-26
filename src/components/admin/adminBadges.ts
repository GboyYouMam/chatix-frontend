export type WarnBadgeLevel = 'clean' | 'warm' | 'hot' | 'cooked';

export function getWarnBadge(count: number, threshold = 3) {
    const level: WarnBadgeLevel =
        count <= 0 ? 'clean' : count >= threshold ? 'cooked' : count === 1 ? 'warm' : 'hot';
    return { label: `[WARN ${count}/${threshold}]`, level };
}

export function getUserBadges(
    user: {
        role: string;
        bannedUntil?: string | Date | null;
        isAutoBanned?: boolean;
        isClown?: boolean;
        isMogged?: boolean;
    },
    now: number,
) {
    const badges: string[] = [];
    if (user.role.toLowerCase() === 'admin') badges.push('ADMIN');
    if (user.bannedUntil && new Date(user.bannedUntil).getTime() > now)
        badges.push(user.isAutoBanned ? 'AUTOBANNED' : 'BANNED');
    if (user.isClown) badges.push('CLOWN');
    if (user.isMogged) badges.push('MOGGED');
    return badges;
}
