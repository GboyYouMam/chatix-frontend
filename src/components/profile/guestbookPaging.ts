export const GUESTBOOK_PAGE_SIZE = 10;

export type PageSlot = number | '…';

const range = (from: number, to: number): number[] => {
    const out: number[] = [];
    for (let page = from; page <= to; page++) out.push(page);
    return out;
};

// Numbered page links for the guestbook pager, at most `width` slots including the ellipses.
// First and last page always show. Near either end the window runs flush to that end,
// otherwise it centres on the current page: 1 2 3 … 9, 1 … 4 … 9, 1 … 7 8 9.
export function pageWindow(current: number, totalPages: number, width = 5): PageSlot[] {
    const slots = Math.max(5, Math.floor(width));
    const total = Math.max(1, Math.floor(totalPages));
    if (total <= slots) return range(1, total);

    const page = Math.min(Math.max(1, Math.floor(current)), total);
    const edge = slots - 2;
    if (page <= edge) return [...range(1, edge), '…', total];
    if (page >= total - edge + 1) return [1, '…', ...range(total - edge + 1, total)];

    const half = Math.floor((slots - 4) / 2);
    return [1, '…', ...range(page - half, page + half), '…', total];
}
