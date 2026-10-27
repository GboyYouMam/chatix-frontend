import assert from 'node:assert/strict';
import test from 'node:test';
import type { RoomDetails } from '../src/api/rooms/types.ts';
import { filterRooms } from '../src/components/rooms/roomFilters.ts';

const room = (overrides: Partial<RoomDetails> & { id: string }): RoomDetails =>
    ({
        title: 'room',
        topic: null,
        publicity: 'public',
        hasPassword: false,
        createdAt: '2026-01-01T00:00:00.000Z',
        creator: { username: 'x' },
        category: null,
        isNsfw: false,
        ...overrides,
    }) as RoomDetails;

const rooms = [
    room({ id: 'a', title: 'Elden Ring grind', category: 'gaming' }),
    room({ id: 'b', title: 'weed talk', topic: 'gaming and grass', category: 'gaming', isNsfw: true }),
    room({ id: 'c', title: 'rust vs go', topic: 'GAMING ENGINES?', category: 'tech' }),
    room({ id: 'd', title: 'uncategorised yap', category: null }),
];
const ids = (list: RoomDetails[]) => list.map((r) => r.id);

test('18+ rooms are hidden by default', () => {
    assert.deepEqual(
        ids(filterRooms(rooms, { query: '', category: null, showNsfw: false })),
        ['a', 'c', 'd'],
    );
});

test('showNsfw brings 18+ rooms back', () => {
    assert.deepEqual(
        ids(filterRooms(rooms, { query: '', category: null, showNsfw: true })),
        ['a', 'b', 'c', 'd'],
    );
});

test('category narrows the list and drops uncategorised rooms', () => {
    assert.deepEqual(
        ids(filterRooms(rooms, { query: '', category: 'gaming', showNsfw: false })),
        ['a'],
    );
});

test('category and text search combine, matching title or topic', () => {
    assert.deepEqual(
        ids(filterRooms(rooms, { query: 'engines', category: 'tech', showNsfw: false })),
        ['c'],
    );
    assert.deepEqual(
        ids(filterRooms(rooms, { query: 'gaming', category: 'gaming', showNsfw: true })),
        ['b'],
    );
    assert.deepEqual(
        ids(filterRooms(rooms, { query: 'gaming', category: 'gaming', showNsfw: false })),
        [],
    );
});

test('no category returns every non-18+ room, including uncategorised ones', () => {
    assert.deepEqual(
        ids(filterRooms(rooms, { query: '   ', category: null, showNsfw: false })),
        ['a', 'c', 'd'],
    );
});
