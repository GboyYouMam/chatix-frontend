import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldLogoutOn401 } from '../src/lib/sessionSync.ts';

test('only logs out the session whose token received the 401', () => {
    assert.equal(shouldLogoutOn401('a', 'a'), true);
    assert.equal(shouldLogoutOn401('a', 'b'), false);
    assert.equal(shouldLogoutOn401('a', null), false);
    assert.equal(shouldLogoutOn401(null, 'a'), false);
});
