import assert from 'node:assert/strict';
import test from 'node:test';
import { MART_TAGLINES, pickTagline } from '../src/components/shop/martQuotes.ts';

test('pickTagline returns the line at the index and wraps around', () => {
    const count = MART_TAGLINES.length;
    assert.ok(count >= 8 && count <= 12);
    assert.equal(pickTagline(0), MART_TAGLINES[0]);
    assert.equal(pickTagline(count - 1), MART_TAGLINES[count - 1]);
    assert.equal(pickTagline(count), MART_TAGLINES[0]);
    assert.equal(pickTagline(count * 3 + 2), MART_TAGLINES[2]);
    assert.equal(pickTagline(-1), MART_TAGLINES[count - 1]);
    assert.equal(pickTagline(-count), MART_TAGLINES[0]);
});

test('every mart tagline is lowercase', () => {
    for (const line of MART_TAGLINES) {
        assert.equal(line, line.toLowerCase(), `not lowercase: ${line}`);
    }
});
