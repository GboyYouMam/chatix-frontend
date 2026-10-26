import assert from 'node:assert/strict';
import test from 'node:test';
import { parseApiError } from '../src/api/errors.ts';

test('parses structured API errors', () => {
    assert.deepEqual(
        parseApiError({
            response: {
                status: 403,
                data: {
                    code: 'BANNED',
                    message: 'u banned, chud',
                    bannedUntil: '2030-01-01T00:00:00.000Z',
                    banReason: 'lol',
                },
            },
        }),
        {
            status: 403,
            code: 'BANNED',
            message: 'u banned, chud',
            bannedUntil: '2030-01-01T00:00:00.000Z',
            banReason: 'lol',
        },
    );
    assert.equal(
        parseApiError({ response: { status: 400, data: { message: ['a', 'b'] } } }).message,
        'a; b',
    );
    assert.deepEqual(parseApiError({ message: 'Network Error' }), {
        status: null,
        code: null,
        message: 'server is cooked. try again later.',
        bannedUntil: null,
        banReason: null,
    });
    assert.equal(parseApiError('oops').message, 'something broke. not ur fault (probably).');
    assert.notEqual(
        parseApiError({ response: { status: 500, data: {} } }).message,
        '[object Object]',
    );
});
