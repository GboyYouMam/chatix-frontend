import type { RoomDetails } from '../../api/rooms/types.ts';
import { isRoomCategory, type RoomCategory } from './roomCategories.ts';

export interface RoomFilters {
    query: string;
    category: RoomCategory | null;
    showNsfw: boolean;
}

// Client-side lobby filter. 18+ rooms are dropped unless showNsfw is on; a category narrows to
// that tag; the text query matches title or topic, case-insensitive.
export const filterRooms = (rooms: RoomDetails[], { query, category, showNsfw }: RoomFilters) => {
    const needle = query.trim().toLowerCase();
    return rooms.filter((room) => {
        if (room.isNsfw && !showNsfw) return false;
        if (category && room.category !== category) return false;
        if (!needle) return true;
        return (
            room.title.toLowerCase().includes(needle) ||
            (room.topic?.toLowerCase().includes(needle) ?? false)
        );
    });
};

export const parseCategoryParam = (value: string | null): RoomCategory | null =>
    isRoomCategory(value) ? value : null;

const SHOW_NSFW_KEY = 'chatix-rooms-show-nsfw';

// The 18+ toggle survives reloads. Storage can be blocked (private mode), so failures are silent.
export const readShowNsfw = (): boolean => {
    try {
        return window.localStorage.getItem(SHOW_NSFW_KEY) === '1';
    } catch {
        return false;
    }
};

export const writeShowNsfw = (value: boolean): void => {
    try {
        window.localStorage.setItem(SHOW_NSFW_KEY, value ? '1' : '0');
    } catch {
        // ignore: the toggle still works for this session
    }
};
