import assert from 'node:assert/strict';
import test from 'node:test';
import { isAgeGateError, parseApiError } from '../src/api/errors.ts';

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

test('detects the 18+ age gate only from its own code', () => {
    const gate = {
        response: { status: 403, data: { message: "age gate: confirm you're 18+ first", code: 'AGE_GATE' } },
    };
    assert.equal(isAgeGateError(gate), true);
    assert.equal(isAgeGateError({ response: { status: 403, data: { code: 'BANNED' } } }), false);
    assert.equal(isAgeGateError(new Error('network down')), false);
});
