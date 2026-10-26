import { humanizeKey } from '../shop/shopFormat.ts';
import { previewFor } from '../shop/shopPreview.ts';

export const BACKGROUND_PATTERNS = [
    'scanlines',
    'starfield',
    'matrix_pink',
    'static',
    'grid',
] as const;

export type BackgroundPattern = (typeof BACKGROUND_PATTERNS)[number];

export const backgroundPatternOf = (value: string | null | undefined): BackgroundPattern | null => {
    if (!value) return null;
    const bare = value.replace(/^bg_/, '');
    return (BACKGROUND_PATTERNS as readonly string[]).includes(bare)
        ? (bare as BackgroundPattern)
        : null;
};

export const cosmeticTitleText = (value: string | null | undefined): string | null => {
    if (!value) return null;
    return value.startsWith('title_') ? humanizeKey(value.slice('title_'.length)) : value;
};

// Title precedence: admin forcedTitle > active fight title > equipped shop title.
// A forced title is already rendered next to the name, so the line under the name is empty then.
export const pickProfileTitle = ({
    forcedTitle,
    fightTitle,
    cosmeticTitle,
}: {
    forcedTitle?: string | null;
    fightTitle?: string | null;
    cosmeticTitle?: string | null;
}): string | null => {
    if (forcedTitle) return null;
    return fightTitle || cosmeticTitleText(cosmeticTitle);
};

// Sticker and name icon values can arrive as item keys or as ready-made glyphs.
export const glyphFor = (value: string): string => {
    if (value.startsWith('sticker_') || value.startsWith('nameicon_')) {
        const preview = previewFor({ key: value });
        return preview.kind === 'glyph' ? preview.glyph : '◆';
    }
    return value;
};
