export const MART_TAGLINES: readonly string[] = [
    "hypergamy is real and it's checking your inventory.",
    "she's not hypergamous, you just have 0 aura.",
    'hypergamy check: pending. buy something.',
    'u broke. hypergamy has left the chat.',
    'every purchase raises your market value by 0.0001%. trust.',
    'invest in drip. the algorithm (and hypergamy) is watching.',
    'your aura is a vibe. hypergamy is a spreadsheet.',
    'mogged by a shelf. welcome to the mogger mart.',
    "hypergamy isn't a personality. buy one.",
    'the market is open. the discourse is open. ur wallet is not.',
    'nobody in the comments asked for ur aura count. buy anyway.',
    'ur market value is currently a rounding error. shop up.',
];

export const EMPTY_DRIP_LINE =
    'inventory empty. ur drip is a rumor. hypergamy check: pending. buy something.';

export const pickTagline = (index: number): string => {
    const count = MART_TAGLINES.length;
    const wrapped = ((Math.trunc(index) % count) + count) % count;
    return MART_TAGLINES[wrapped];
};
