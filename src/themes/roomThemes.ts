// Pure room theme definitions. Every theme is a full set of CSS variables applied on the
// room page root; components read var(--room-*) with fallbacks to the global tokens.

export const ROOM_THEME_KEYS = [
    'basement',
    'fight_club',
    'vaporwave',
    'corpo',
    'crime_scene',
    'win98',
    'graveyard',
] as const;

export type ThemeKey = (typeof ROOM_THEME_KEYS)[number];

export const DEFAULT_ROOM_THEME: ThemeKey = 'basement';

export const ROOM_THEME_META: Record<ThemeKey, { name: string; tagline: string }> = {
    basement: { name: 'basement', tagline: 'the default. dark, damp, mogging.' },
    fight_club: { name: 'fight club', tagline: 'first rule: soap. second rule: soap.' },
    vaporwave: { name: 'vaporwave', tagline: 'a e s t h e t i c. dial-up in the distance.' },
    corpo: { name: 'corpo', tagline: 'per my last email. very on brand. very boring.' },
    crime_scene: { name: 'crime scene', tagline: 'do not cross. cross anyway.' },
    win98: { name: 'win98', tagline: 'click ok to continue. cringe.' },
    graveyard: { name: 'graveyard', tagline: 'for dead rooms only. rip.' },
};

// Theme keys map to shop items: basement is free, everything else is bought once.
export const themeItemKey = (key: ThemeKey): string | null =>
    key === DEFAULT_ROOM_THEME ? null : `theme_${key}`;

export const roomThemeOf = (value: string | null | undefined): ThemeKey =>
    (ROOM_THEME_KEYS as readonly string[]).includes(value ?? '')
        ? (value as ThemeKey)
        : DEFAULT_ROOM_THEME;

export const isThemeOwned = (key: ThemeKey, ownedItemKeys: ReadonlySet<string>): boolean => {
    const item = themeItemKey(key);
    return item === null || ownedItemKeys.has(item);
};

const MONO = "'Courier New', Courier, monospace";
const SANS = 'Arial, Helvetica, sans-serif';

export const ROOM_THEMES: Record<ThemeKey, Record<string, string>> = {
    basement: {
        '--room-bg': '#0a0a0a',
        '--room-surface': '#111111',
        '--room-text': '#e0e0e0',
        '--room-muted': '#9a9a9a',
        '--room-accent': '#fa4d98',
        '--room-on-accent': '#000000',
        '--room-border': '#333333',
        '--room-font-body': MONO,
        '--room-font-heading': MONO,
        '--room-pattern': 'none',
    },
    fight_club: {
        '--room-bg': '#e8a3b8',
        '--room-surface': '#f3c6d3',
        '--room-text': '#1c0a12',
        '--room-muted': '#4a2335',
        '--room-accent': '#7a0c2e',
        '--room-on-accent': '#ffffff',
        '--room-warn': '#8a4300',
        '--room-border': '#8c3a57',
        '--room-font-body': SANS,
        '--room-font-heading': "'Arial Black', Impact, sans-serif",
        '--room-pattern':
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.45) 0 6px, transparent 7px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.35) 0 9px, transparent 10px), radial-gradient(circle at 45% 85%, rgba(255,255,255,0.3) 0 5px, transparent 6px)',
    },
    vaporwave: {
        '--room-bg': '#2b0a3d',
        '--room-surface': '#3d1260',
        '--room-text': '#fdf0ff',
        '--room-muted': '#e0b0f5',
        '--room-accent': '#ff8fd8',
        '--room-on-accent': '#2b0a3d',
        '--room-border': '#7b2cbf',
        '--room-font-body': MONO,
        '--room-font-heading': "'MS Gothic', 'Courier New', monospace",
        '--room-pattern':
            'linear-gradient(180deg, rgba(43,10,61,0) 0%, rgba(106,27,122,0.6) 70%, rgba(255,113,206,0.45) 100%)',
    },
    corpo: {
        '--room-bg': '#ffffff',
        '--room-surface': '#f4f5f7',
        '--room-text': '#1f2328',
        '--room-muted': '#5a5f66',
        '--room-accent': '#0b5cad',
        '--room-on-accent': '#ffffff',
        '--room-warn': '#9a5200',
        '--room-border': '#d0d7de',
        '--room-font-body': SANS,
        '--room-font-heading': SANS,
        '--room-pattern': 'none',
    },
    crime_scene: {
        '--room-bg': '#0b0b0b',
        '--room-surface': '#1a1a1a',
        '--room-text': '#f5f5f5',
        '--room-muted': '#b8b8b8',
        '--room-accent': '#ffd60a',
        '--room-on-accent': '#0b0b0b',
        '--room-border': '#ffd60a',
        '--room-font-body': MONO,
        '--room-font-heading': "'Arial Black', Impact, sans-serif",
        '--room-pattern': 'repeating-linear-gradient(45deg, #ffd60a 0 14px, #0b0b0b 14px 28px)',
    },
    win98: {
        '--room-bg': '#c0c0c0',
        '--room-surface': '#d4d0c8',
        '--room-text': '#000000',
        '--room-muted': '#404040',
        '--room-accent': '#000080',
        '--room-on-accent': '#ffffff',
        '--room-warn': '#804000',
        '--room-border': '#808080',
        '--room-font-body': "Tahoma, 'MS Sans Serif', Arial, sans-serif",
        '--room-font-heading': "Tahoma, 'MS Sans Serif', Arial, sans-serif",
        '--room-pattern': 'none',
    },
    graveyard: {
        '--room-bg': '#1c1f1c',
        '--room-surface': '#262a26',
        '--room-text': '#d6dcd3',
        '--room-muted': '#a3ab9f',
        '--room-accent': '#8fc46f',
        '--room-on-accent': '#0f140d',
        '--room-border': '#3b423a',
        '--room-font-body': "Georgia, 'Times New Roman', serif",
        '--room-font-heading': "Georgia, 'Times New Roman', serif",
        '--room-pattern': 'none',
    },
};

export const roomThemeStyle = (key: ThemeKey): Record<string, string> => ROOM_THEMES[key];
