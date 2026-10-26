import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RARE_HINTS, shouldShowRareHint } from '../src/utils/fightHints.ts';

test('rare hints require a low roll and at least a day between displays', () => {
    const now = 2_000_000;
    assert.equal(shouldShowRareHint(now, null, 0.01), true);
    assert.equal(shouldShowRareHint(now, null, 0.5), false);
    assert.equal(shouldShowRareHint(now, now - 2 * 60 * 60 * 1000, 0.01), false);
    assert.equal(shouldShowRareHint(now, now - 25 * 60 * 60 * 1000, 0.01), true);
    assert.equal(RARE_HINTS.length >= 4, true);
});
