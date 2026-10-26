export const formatAmount = (amount: number): string =>
    String(Math.trunc(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export const formatPrice = (price: number): string => `${formatAmount(price)} aura`;

export const canAfford = (aura: number, price: number): boolean => aura >= price;

export const humanizeKey = (key: string): string => key.replace(/_/g, ' ').toLowerCase();

export const MYSTERY_ODDS_TEXT = 'odds: common 70% · rare 25% · legendary 5%';

const PURCHASE_ERROR_MESSAGES: Record<string, string> = {
    BROKE: 'u broke. hypergamy has left the chat.',
    ALREADY_OWNED: 'already yours, chud. stop hoarding.',
    LOCKED: 'locked. go earn the thing first.',
};

export const purchaseErrorMessage = (code: string | null | undefined): string | null =>
    code ? (PURCHASE_ERROR_MESSAGES[code] ?? null) : null;

const EQUIP_ERROR_MESSAGES: Record<string, string> = {
    UNKNOWN_ITEM: 'never heard of that one, chud.',
    WRONG_SLOT: "that doesn't go there. nice try.",
    NOT_OWNED: "u don't own that, chud.",
};

export const equipErrorMessage = (code: string | null | undefined): string | null =>
    code ? (EQUIP_ERROR_MESSAGES[code] ?? null) : null;
