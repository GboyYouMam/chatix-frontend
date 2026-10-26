export interface BanCountdown { days: number; hours: number; minutes: number; seconds: number; expired: boolean; permanent: boolean }
export function getBanCountdown(bannedUntil: string | null, now: number): BanCountdown {
    if (!bannedUntil) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false, permanent: true };
    let remaining = Math.max(0, Date.parse(bannedUntil) - now);
    const expired = remaining === 0;
    const days = Math.floor(remaining / 86400000); remaining %= 86400000;
    const hours = Math.floor(remaining / 3600000); remaining %= 3600000;
    const minutes = Math.floor(remaining / 60000); remaining %= 60000;
    return { days, hours, minutes, seconds: Math.floor(remaining / 1000), expired, permanent: false };
}
export const formatCountdown = (c: BanCountdown) => `${String(c.days).padStart(2, '0')}d ${String(c.hours).padStart(2, '0')}h ${String(c.minutes).padStart(2, '0')}m ${String(c.seconds).padStart(2, '0')}s`;
export const BAN_TAUNTS = ['touch grass in the meantime', 'ur aura is in the negatives now', 'the mods have spoken. cry about it.', 'you got cooked, respectfully', 'log off and reflect, chud', 'this is your training arc', 'the lobby moved on without you', 'go hydrate, bum'] as const;
export const APPEAL_DENIALS = ['appeal denied lmao', 'still no', 'mods said nah', 'request mogged', 'denied with prejudice', 'try touching grass'] as const;
export function pickNext(list: readonly string[], current: string) { return list[(list.indexOf(current) + 1) % list.length]; }
