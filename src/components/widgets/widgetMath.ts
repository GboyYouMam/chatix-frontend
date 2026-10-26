export type TrendDirection = 'up' | 'down' | 'flat';

export const moveItem = <T>(list: readonly T[], index: number, dir: -1 | 1): T[] => {
    const next = [...list];
    const target = index + dir;
    if (index < 0 || index >= list.length || target < 0 || target >= list.length) return next;
    [next[index], next[target]] = [next[target], next[index]];
    return next;
};

// Compares the last two daily snapshots. A zero base reads as a full move, not NaN.
export const auraTrend = (
    points: ReadonlyArray<{ aura: number | string }>,
): { pct: number; direction: TrendDirection } => {
    if (points.length < 2) return { pct: 0, direction: 'flat' };
    const previous = Number(points[points.length - 2].aura);
    const last = Number(points[points.length - 1].aura);
    const change = last - previous;
    const direction: TrendDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    const raw = previous === 0 ? Math.sign(change) * 100 : (change / Math.abs(previous)) * 100;
    return { pct: Math.round(raw) || 0, direction };
};

// 1000 debt is a full bar. Negative debt (a cushion) reads as an empty bar.
export const debtPercent = (debt: number | string): number => {
    const value = Number(debt);
    if (!(value > 0)) return 0;
    return Math.min(100, Math.round(value / 10));
};

export const padVisitor = (count: number, width = 7): string =>
    String(Math.max(0, Math.trunc(count))).padStart(width, '0');

export const relativeAgo = (iso: string, now = Date.now()): string => {
    const time = Date.parse(iso);
    if (Number.isNaN(time)) return '';
    const seconds = Math.max(0, Math.floor((now - time) / 1000));
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};
