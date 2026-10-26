import assert from 'node:assert/strict';
import test from 'node:test';
import { createTripleClickDetector, isSecretQuery } from '../src/utils/easterEgg.ts';

test('triple click detector counts only clicks inside the window and resets', () => {
    const detect = createTripleClickDetector();
    assert.equal(detect(0), false);
    assert.equal(detect(500), false);
    assert.equal(detect(1400), true);
    assert.equal(detect(1500), false);
    assert.equal(detect(1600), false);

    const expired = createTripleClickDetector();
    expired(0);
    expired(500);
    assert.equal(expired(1600), false);
});

test('secret query ignores surrounding whitespace and case', () => {
    assert.equal(isSecretQuery('  First Rule '), true);
    assert.equal(isSecretQuery('first rules'), false);
});
