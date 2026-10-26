import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCountdown, getBanCountdown, pickNext } from '../src/utils/banScreen.ts';

test('formats temporary and permanent bans', () => {
    const countdown = getBanCountdown(
        '2030-01-02T03:04:05.000Z',
        Date.parse('2030-01-01T00:00:00.000Z'),
    );
    assert.deepEqual(countdown, {
        days: 1,
        hours: 3,
        minutes: 4,
        seconds: 5,
        expired: false,
        permanent: false,
    });
    assert.equal(formatCountdown(countdown), '01d 03h 04m 05s');
    assert.equal(getBanCountdown('2020-01-01', Date.parse('2021-01-01')).expired, true);
    assert.equal(getBanCountdown(null, 0).permanent, true);
    assert.equal(pickNext(['a', 'b'], 'b'), 'a');
});
