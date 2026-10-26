import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPadKeys } from '../src/hooks/fight-club/qtePad.ts';

test('buildPadKeys always returns six unique letters including the target once', () => {
    for (let run = 0; run < 1000; run++) {
        const keys = buildPadKeys('Q', Math.random);
        assert.equal(keys.length, 6);
        assert.equal(new Set(keys).size, 6);
        assert.equal(keys.filter((key) => key === 'Q').length, 1);
        assert.ok(keys.every((key) => /^[A-Z]$/.test(key)));
    }
});

test('buildPadKeys is deterministic for the same random sequence', () => {
    const seeded = () => {
        let value = 12345;
        return () => ((value = (value * 16807) % 2147483647) - 1) / 2147483646;
    };
    assert.deepEqual(buildPadKeys('Q', seeded()), buildPadKeys('Q', seeded()));
});
