import assert from 'node:assert/strict';
import test from 'node:test';
import { toHitKey } from '../src/hooks/fight-club/qteKey.ts';

const event = (overrides: Record<string, unknown> = {}) => ({
    key: 'a',
    repeat: false,
    isTrusted: true,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    ...overrides,
});

test('toHitKey accepts a trusted, unmodified letter', () => {
    assert.equal(toHitKey(event()), 'A');
});

test('toHitKey rejects repeats, synthetic events, modifiers, and non-letters', () => {
    for (const input of [
        event({ repeat: true }),
        event({ isTrusted: false }),
        event({ ctrlKey: true }),
        event({ key: 'Enter' }),
        event({ key: '1' }),
    ]) {
        assert.equal(toHitKey(input), null);
    }
});
