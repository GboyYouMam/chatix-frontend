export const ACCENT_PALETTE = {
    hot_pink: '#fa4d98',
    magenta: '#e11d74',
    acid_pink: '#ff4fd8',
    deep_violet: '#7c3aed',
    cold_red: '#ef3b5c',
    rose: '#fb7185',
} as const;

export type AccentPaletteKey = keyof typeof ACCENT_PALETTE;

export const DEFAULT_ACCENT = ACCENT_PALETTE.hot_pink;

export const isAccentPaletteKey = (value: string): value is AccentPaletteKey =>
    Object.prototype.hasOwnProperty.call(ACCENT_PALETTE, value);

// Accepts a palette key ("magenta"), a prefixed item key ("accent_magenta", "namecolor_rose")
// or an already resolved HEX from the backend. Anything else falls back to the default accent.
export const resolveAccentColor = (value: string | null | undefined): string => {
    if (!value) return DEFAULT_ACCENT;
    if (value.startsWith('#')) return value;
    const bare = value.replace(/^(accent|namecolor)_/, '');
    return isAccentPaletteKey(bare) ? ACCENT_PALETTE[bare] : DEFAULT_ACCENT;
};
