// Pure UTC day helpers for the once-per-day stimulus guard.

export const STIMULUS_STORAGE_KEY = 'chatix:stimulus-day';

export const utcDayKey = (date: Date): string => date.toISOString().slice(0, 10);

export const isClaimedToday = (storedDay: string | null, now: Date): boolean =>
    storedDay === utcDayKey(now);
