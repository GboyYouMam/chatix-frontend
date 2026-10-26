export const WIDGET_KEYS = [
    'now_playing',
    'medal_rack',
    'aura_chart',
    'fight_record',
    'top_glazers',
    'debt_meter',
    'yap_stats',
    'guestbook',
    'status_line',
    'rap_sheet',
    'hit_counter',
    'sticker_board',
    'wanted_poster',
] as const;

export type WidgetKey = (typeof WIDGET_KEYS)[number];

export const isWidgetKey = (value: string): value is WidgetKey =>
    (WIDGET_KEYS as readonly string[]).includes(value);

export const WIDGET_META: Record<WidgetKey, { title: string; subtitle: string }> = {
    now_playing: { title: 'now playing', subtitle: 'currently rotting to' },
    medal_rack: { title: 'medal rack', subtitle: 'shiny things u got for existing' },
    aura_chart: { title: '$aura', subtitle: 'the ticker nobody asked for' },
    fight_record: { title: 'fight record', subtitle: 'ur bloody history' },
    top_glazers: { title: 'top glazers', subtitle: 'the simps, ranked' },
    debt_meter: { title: 'debt', subtitle: 'how cooked are u' },
    yap_stats: { title: 'yap stats', subtitle: 'u talk a lot. we noticed.' },
    guestbook: { title: 'guestbook', subtitle: 'sign it. we are watching.' },
    status_line: { title: 'status', subtitle: "what i'm doing rn" },
    rap_sheet: { title: 'rap sheet', subtitle: 'convictions. no appeals.' },
    hit_counter: { title: 'visitors', subtitle: 'since the 2003 era' },
    sticker_board: { title: 'stickers', subtitle: 'slapped on the wall' },
    wanted_poster: { title: 'wanted', subtitle: 'reward for capture' },
};

// Widgets that the owner cannot switch off once their condition holds (spec §2).
export const isForcedWidget = (
    key: WidgetKey,
    state: { hasConvictions: boolean; debt: number },
): boolean => {
    if (key === 'rap_sheet') return state.hasConvictions;
    if (key === 'wanted_poster') return state.debt >= 1000;
    return false;
};

// Widgets that need a shop item in the inventory (spec §6).
export const WIDGET_UNLOCK_ITEM: Partial<Record<WidgetKey, 'hit_counter' | 'sticker_board'>> = {
    hit_counter: 'hit_counter',
    sticker_board: 'sticker_board',
};

export const isWidgetLocked = (key: WidgetKey, inventoryKeys: ReadonlySet<string>): boolean => {
    if (key === 'sticker_board') {
        return ![...inventoryKeys].some((itemKey) => itemKey.startsWith('sticker_'));
    }
    const unlock = WIDGET_UNLOCK_ITEM[key];
    return Boolean(unlock) && !inventoryKeys.has(unlock!);
};

export interface EditorRow {
    key: WidgetKey;
    enabled: boolean;
}

// Enabled widgets keep the saved order; the rest follow in catalog order, switched off.
export const buildEditorRows = (layout: readonly string[]): EditorRow[] => {
    const enabled = [...new Set(layout.filter(isWidgetKey))];
    return [
        ...enabled.map((key) => ({ key, enabled: true })),
        ...WIDGET_KEYS.filter((key) => !enabled.includes(key)).map((key) => ({
            key,
            enabled: false,
        })),
    ];
};
