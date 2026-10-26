import assert from 'node:assert/strict';
import test from 'node:test';
import { isClaimedToday, utcDayKey } from '../src/lib/stimulusDay.ts';

test('the stimulus day is the UTC date, so the claim resets at UTC midnight', () => {
    assert.equal(utcDayKey(new Date('2026-10-27T23:59:59.999Z')), '2026-10-27');
    assert.equal(utcDayKey(new Date('2026-10-28T00:00:00.000Z')), '2026-10-28');
});

test('a claim stored for today blocks another one, yesterday does not', () => {
    const now = new Date('2026-10-27T12:00:00.000Z');
    assert.equal(isClaimedToday('2026-10-27', now), true);
    assert.equal(isClaimedToday('2026-10-26', now), false);
    assert.equal(isClaimedToday(null, now), false);
});
