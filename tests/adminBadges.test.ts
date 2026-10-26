import assert from 'node:assert/strict';
import test from 'node:test';
import { getUserBadges, getWarnBadge } from '../src/components/admin/adminBadges.ts';

test('warning badge reflects each severity and the actual count', () => {
    assert.deepEqual(getWarnBadge(0), { label: '[WARN 0/3]', level: 'clean' });
    assert.deepEqual(getWarnBadge(1), { label: '[WARN 1/3]', level: 'warm' });
    assert.deepEqual(getWarnBadge(2), { label: '[WARN 2/3]', level: 'hot' });
    assert.deepEqual(getWarnBadge(4), { label: '[WARN 4/3]', level: 'cooked' });
});

test('user badges include role, active autoban and clown in order', () => {
    assert.deepEqual(
        getUserBadges(
            {
                role: 'admin',
                bannedUntil: '2030-01-02T00:00:00.000Z',
                isAutoBanned: true,
                isClown: true,
                isMogged: false,
            },
            Date.parse('2030-01-01T00:00:00.000Z'),
        ),
        ['ADMIN', 'AUTOBANNED', 'CLOWN'],
    );
});

test('expired bans do not get a banned badge', () => {
    assert.deepEqual(
        getUserBadges(
            {
                role: 'user',
                bannedUntil: '2020-01-01T00:00:00.000Z',
                isAutoBanned: false,
                isClown: false,
                isMogged: true,
            },
            Date.parse('2021-01-01T00:00:00.000Z'),
        ),
        ['MOGGED'],
    );
});
