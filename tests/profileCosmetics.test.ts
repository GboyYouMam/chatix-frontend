import assert from 'node:assert/strict';
import test from 'node:test';
import {
    backgroundPatternOf,
    pickProfileTitle,
} from '../src/components/cosmetics/profileCosmetics.ts';

test('title precedence is forced > fight > equipped shop title', () => {
    assert.equal(
        pickProfileTitle({
            forcedTitle: 'admin says',
            fightTitle: 'duelist',
            cosmeticTitle: 'title_aura_merchant',
        }),
        null,
    );
    assert.equal(
        pickProfileTitle({
            forcedTitle: null,
            fightTitle: 'duelist',
            cosmeticTitle: 'title_aura_merchant',
        }),
        'duelist',
    );
    assert.equal(
        pickProfileTitle({
            forcedTitle: null,
            fightTitle: null,
            cosmeticTitle: 'title_aura_merchant',
        }),
        'aura merchant',
    );
    assert.equal(pickProfileTitle({}), null);
});

test('only known background patterns render, bg_ prefix is optional', () => {
    assert.equal(backgroundPatternOf('bg_matrix_pink'), 'matrix_pink');
    assert.equal(backgroundPatternOf('grid'), 'grid');
    assert.equal(backgroundPatternOf('bg_rainbow_vomit'), null);
    assert.equal(backgroundPatternOf(null), null);
});
