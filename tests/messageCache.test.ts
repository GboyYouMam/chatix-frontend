import { test } from 'node:test';
import assert from 'node:assert/strict';
import { appendMessageToPages, markMessageDeleted } from '../src/hooks/rooms/messageCache.ts';
import type { MessageData, MessagePage } from '../src/api/messages/types.ts';
import type { InfiniteData } from '@tanstack/react-query';

const message = (id: string): MessageData => ({ id, cipherText: id, createdAt: new Date() });
const pages = (...items: MessageData[]): InfiniteData<MessagePage, string | null> => ({
    pages: [{ items, nextCursor: null }],
    pageParams: [null],
});

test('appends when the first page is empty and ignores duplicate ids', () => {
    const initial = pages();
    assert.deepEqual(appendMessageToPages(initial, message('a'))?.pages[0].items, [message('a')]);
    assert.equal(appendMessageToPages(pages(message('a')), message('a'))?.pages[0].items.length, 1);
});

test('marks a deleted message in place as a tombstone', () => {
    const initial = pages(message('a'), message('b'));
    const result = markMessageDeleted(initial, 'a');
    assert.deepEqual(
        result?.pages[0].items.map(({ id }) => id),
        ['a', 'b'],
    );
    assert.equal(result?.pages[0].items[0].isDeleted, true);
    assert.equal(result?.pages[0].items[0].cipherText, 'GOT DELETED LMAO CRY ABOUT IT');
});
