// Room categories as the backend knows them. The lobby filter, the create/edit pickers and
// the card tag all read from here, so a new category only needs adding in one place.
export const ROOM_CATEGORIES = [
    'gaming',
    'tech',
    'memes',
    'music',
    'anime',
    'movies',
    'sports',
    'study',
    'art',
    'politics',
    'vent',
    'offtopic',
] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number];

export const isRoomCategory = (value: unknown): value is RoomCategory =>
    typeof value === 'string' && (ROOM_CATEGORIES as readonly string[]).includes(value);
