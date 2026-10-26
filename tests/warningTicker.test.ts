import assert from 'node:assert/strict';
import test from 'node:test';
import { formatWarningTicker } from '../src/components/profile/warningTicker.ts';

test('formats active warnings in API order and handles an empty list', () => {
    assert.deepEqual(formatWarningTicker([{ reason: 'spam' }, { reason: 'being a chud' }]), [
        '⚠ WARN 1/3: spam',
        '⚠ WARN 2/3: being a chud',
    ]);
    assert.deepEqual(formatWarningTicker([]), []);
});
