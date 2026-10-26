export const RARE_HINTS = [
    'one of these rooms is hiding a basement.',
    "first rule: you don't type the first rule. or do you",
    'the soap market has a door nobody mentions.',
    'somewhere, a duel is waiting for a witness.',
] as const;

export const shouldShowRareHint = (now: number, lastShownAt: number | null, roll: number) =>
    roll < 1 / 40 && (lastShownAt === null || now - lastShownAt >= 24 * 60 * 60 * 1000);
