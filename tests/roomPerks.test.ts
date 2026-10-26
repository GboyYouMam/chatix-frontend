import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCountdown, isActiveUntil } from '../src/components/rooms/roomPerks.ts';

const NOW = Date.UTC(2026, 9, 27, 12, 0, 0);

test('boosts and spotlights are live only before their expiry', () => {
    assert.equal(isActiveUntil(new Date(NOW + 1000).toISOString(), NOW), true);
    assert.equal(isActiveUntil(new Date(NOW).toISOString(), NOW), false);
    assert.equal(isActiveUntil(new Date(NOW - 1).toISOString(), NOW), false);
    assert.equal(isActiveUntil(null, NOW), false);
    assert.equal(isActiveUntil('not a date', NOW), false);
});

test('countdown reads m:ss and never goes negative', () => {
    assert.equal(formatCountdown(new Date(NOW + 9 * 60_000 + 5_000).toISOString(), NOW), '9:05');
    assert.equal(formatCountdown(new Date(NOW + 59_900).toISOString(), NOW), '0:59');
    assert.equal(formatCountdown(new Date(NOW - 5_000).toISOString(), NOW), '0:00');
    assert.equal(formatCountdown(undefined, NOW), '0:00');
});
