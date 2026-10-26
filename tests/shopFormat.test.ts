import assert from 'node:assert/strict';
import test from 'node:test';
import {
    canAfford,
    equipErrorMessage,
    formatPrice,
    humanizeKey,
    purchaseErrorMessage,
} from '../src/components/shop/shopFormat.ts';

test('formats aura prices with thousands separators', () => {
    assert.equal(formatPrice(150), '150 aura');
    assert.equal(formatPrice(2500), '2,500 aura');
    assert.equal(formatPrice(10000), '10,000 aura');
    assert.equal(formatPrice(1234567), '1,234,567 aura');
});

test('buying with exactly enough aura is allowed, one short is not', () => {
    assert.equal(canAfford(500, 500), true);
    assert.equal(canAfford(499, 500), false);
    assert.equal(canAfford(0, 1), false);
});

test('negative aura (debt fallout) can never afford anything', () => {
    assert.equal(canAfford(-1, 1), false);
    assert.equal(canAfford(-1000, 150), false);
});

test('maps purchase error codes to in-voice copy and ignores unknown codes', () => {
    assert.equal(purchaseErrorMessage('BROKE'), 'u broke. go farm.');
    assert.equal(purchaseErrorMessage('ALREADY_OWNED'), 'already yours, chud. stop hoarding.');
    assert.equal(purchaseErrorMessage('LOCKED'), 'locked. go earn the thing first.');
    assert.equal(purchaseErrorMessage('SOMETHING_ELSE'), null);
    assert.equal(purchaseErrorMessage(null), null);
});

test('maps equip error codes to in-voice copy', () => {
    assert.equal(equipErrorMessage('NOT_OWNED'), "u don't own that, chud.");
    assert.equal(equipErrorMessage('WRONG_SLOT'), "that doesn't go there. nice try.");
    assert.equal(equipErrorMessage('UNKNOWN_ITEM'), 'never heard of that one, chud.');
    assert.equal(equipErrorMessage('BROKE'), null);
});

test('humanizes item keys for display without raw ids', () => {
    assert.equal(humanizeKey('sticker_killsquad'), 'sticker killsquad');
});
