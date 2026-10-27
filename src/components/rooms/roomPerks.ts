import type { ShopUseItemKey } from '../../api/shop/types.ts';

// Pure perk helpers: timers, countdown text and in-voice copy for item use.

// Tag the rename curse glues onto the victim's name for 1h.
export const RENAME_CURSE_TAG = '(certified npc)';

export const isActiveUntil = (until: string | Date | null | undefined, now: number): boolean => {
    if (!until) return false;
    const time = new Date(until).getTime();
    return Number.isFinite(time) && time > now;
};

// Remaining time as m:ss ("9:05"); past or invalid values read as "0:00".
export const formatCountdown = (until: string | Date | null | undefined, now: number): string => {
    if (!until) return '0:00';
    const remaining = Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000));
    if (!Number.isFinite(remaining)) return '0:00';
    const minutes = Math.floor(remaining / 60);
    const seconds = String(remaining % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
};

export const successCopyFor = (itemKey: ShopUseItemKey, target?: string): string => {
    const who = target ? `@${target}` : 'u';
    const copy: Record<ShopUseItemKey, string> = {
        clown_stamp: `${who} is now certified clown. 24h. no appeal.`,
        rename_curse: `${who} now goes by ${RENAME_CURSE_TAG}. 1h. enjoy.`,
        aura_tax: 'aura tax paid. this room is sponsored by u. bow.',
        spotlight: 'spotlight on. ur message is on top for 10 min. no pressure.',
        room_boost: 'room boosted. promoted for 1h. touch grass later.',
        fight_insurance: 'insurance armed. next loss costs half. smart chud.',
        debt_forgiveness: '100 debt gone. the bank forgives u. this time.',
    };
    return copy[itemKey];
};

const USE_ERROR_MESSAGES: Record<string, string> = {
    ALREADY_CURSED: 'they already got cursed. chill.',
    NOT_OWNED: "u don't own that, chud. buy it first.",
    NOT_YOURS: "that's not yours to curse, chud.",
    SELF_TARGET: 'cursing urself? bold. no.',
    ADMIN_TARGET: 'admins are untouchable. nice try.',
    ROOM_NOT_LIVE: 'that room is dead. nothing to boost.',
    MESSAGE_NOT_LIVE: 'that message is gone. the room moved on.',
    BROKE: 'u broke. go farm.',
};

export const errorCopyFor = (code: string | null | undefined): string | null =>
    code ? (USE_ERROR_MESSAGES[code] ?? null) : null;

export const ownedCount = (
    inventory: ReadonlyArray<{ itemKey: string; quantity: number }> | undefined,
    itemKey: string,
): number => inventory?.find((entry) => entry.itemKey === itemKey)?.quantity ?? 0;
