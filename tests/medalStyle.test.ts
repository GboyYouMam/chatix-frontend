import assert from 'node:assert/strict';
import test from 'node:test';
import {
    medalShape,
    medalStyle,
    ribbonStripes,
    shadeHex,
} from '../src/components/achievements/medalStyle.ts';

test('every catalog icon key maps to its medal shape', () => {
    assert.equal(medalShape('star'), 'star');
    assert.equal(medalShape('shield'), 'shield');
    assert.equal(medalShape('cross'), 'cross');
    assert.equal(medalShape('laurel'), 'laurel');
    assert.equal(medalShape('heart'), 'heart');
    assert.equal(medalShape('broken'), 'broken');
    assert.equal(medalShape('eye'), 'eye');
});

test('unknown or empty icon keys fall back to the star', () => {
    assert.equal(medalShape('skull'), 'star');
    assert.equal(medalShape(''), 'star');
    assert.equal(medalShape(undefined), 'star');
});

test('metal follows the tier and only the secret tier is holographic', () => {
    const base = { category: 'aura' as const, icon: 'star' };
    assert.equal(medalStyle({ ...base, tier: 'bronze' }).metal, '#b0793a');
    assert.equal(medalStyle({ ...base, tier: 'silver' }).metal, '#c9ced6');
    assert.equal(medalStyle({ ...base, tier: 'gold' }).metal, '#e7c35a');
    assert.equal(medalStyle({ ...base, tier: 'shame' }).metal, '#1c1c20');
    assert.equal(medalStyle({ ...base, tier: 'secret' }).holo, true);
    assert.equal(medalStyle({ ...base, tier: 'gold' }).holo, false);
});

test('ribbon stripes come from the category palette and fall back to neutral', () => {
    assert.deepEqual(ribbonStripes({ category: 'fight' }), ['#ef4444', '#7f1d1d', '#fa4d98']);
    const unknown = ribbonStripes({ category: 'future_category' as 'aura' });
    assert.ok(unknown.includes('#71717a'));
    const style = medalStyle({
        category: 'future_category' as 'aura',
        tier: 'bronze',
        icon: 'eye',
    });
    assert.equal(style.shape, 'eye');
    assert.ok(style.ribbonStripes.length > 0);
});

test('shadeHex mixes toward white or black', () => {
    assert.equal(shadeHex('#000000', 0.5), '#808080');
    assert.equal(shadeHex('#ffffff', -1), '#000000');
    assert.equal(shadeHex('#b0793a', 0), '#b0793a');
});
