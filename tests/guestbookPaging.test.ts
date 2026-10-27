import assert from 'node:assert/strict';
import test from 'node:test';
import { pageWindow } from '../src/components/profile/guestbookPaging.ts';

test('page window runs flush to the start while the current page is near it', () => {
    assert.deepEqual(pageWindow(1, 9), [1, 2, 3, '…', 9]);
    assert.deepEqual(pageWindow(3, 9), [1, 2, 3, '…', 9]);
});

test('page window centres on the current page away from both ends', () => {
    assert.deepEqual(pageWindow(4, 9), [1, '…', 4, '…', 9]);
    assert.deepEqual(pageWindow(5, 9), [1, '…', 5, '…', 9]);
    assert.deepEqual(pageWindow(6, 9), [1, '…', 6, '…', 9]);
});

test('page window runs flush to the end while the current page is near it', () => {
    assert.deepEqual(pageWindow(7, 9), [1, '…', 7, 8, 9]);
    assert.deepEqual(pageWindow(9, 9), [1, '…', 7, 8, 9]);
});

test('page window shows every page when they all fit', () => {
    assert.deepEqual(pageWindow(1, 1), [1]);
    assert.deepEqual(pageWindow(2, 3), [1, 2, 3]);
    assert.deepEqual(pageWindow(1, 5), [1, 2, 3, 4, 5]);
});

test('page window tolerates empty and out-of-range input', () => {
    assert.deepEqual(pageWindow(1, 0), [1]);
    assert.deepEqual(pageWindow(99, 9), [1, '…', 7, 8, 9]);
    assert.deepEqual(pageWindow(0, 9), [1, 2, 3, '…', 9]);
});

test('wider windows keep the same ends and widen the middle', () => {
    assert.deepEqual(pageWindow(10, 20, 7), [1, '…', 9, 10, 11, '…', 20]);
    assert.equal(pageWindow(10, 20, 7).length, 7);
});
