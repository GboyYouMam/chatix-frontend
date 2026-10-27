import assert from 'node:assert/strict';
import test from 'node:test';
import {
    sortForRack,
    visibleRibbons,
    type AchievementDef,
} from '../src/components/achievements/ribbons.ts';
import { ribbonStripes } from '../src/components/achievements/medalStyle.ts';

const catalog: AchievementDef[] = [
    {
        key: 'shame',
        name: 'shame',
        description: '',
        category: 'moderation',
        tier: 'shame',
        icon: '',
        unlockedPercent: 0,
    },
    {
        key: 'bronze',
        name: 'bronze',
        description: '',
        category: 'aura',
        tier: 'bronze',
        icon: '',
        unlockedPercent: 0,
    },
    {
        key: 'gold',
        name: 'gold',
        description: '',
        category: 'debt',
        tier: 'gold',
        icon: '',
        unlockedPercent: 0,
    },
    {
        key: 'secret',
        name: 'secret',
        description: '',
        category: 'secret',
        tier: 'secret',
        icon: '',
        unlockedPercent: 0,
    },
    {
        key: 'silver',
        name: 'silver',
        description: '',
        category: 'fight',
        tier: 'silver',
        icon: '',
        unlockedPercent: 0,
    },
];

test('rack sorts tiers before unlock date and every catalog category has stripes', () => {
    const ordered = sortForRack(
        catalog.map(({ key }) => ({ key, unlockedAt: '2026-01-01' })),
        catalog,
    );
    assert.deepEqual(
        ordered.map(({ key }) => key),
        ['gold', 'silver', 'bronze', 'secret', 'shame'],
    );
    for (const def of catalog) {
        assert.ok(ribbonStripes(def).length > 0, `${def.category} has a palette`);
    }
});

test('visible ribbons cap the rack and reserve the last cell for the +N chip', () => {
    assert.deepEqual(visibleRibbons([1, 2, 3], 16), { shown: [1, 2, 3], hidden: 0 });
    const exact = Array.from({ length: 16 }, (_, i) => i);
    assert.deepEqual(visibleRibbons(exact, 16), { shown: exact, hidden: 0 });
    const many = Array.from({ length: 35 }, (_, i) => i);
    const desktop = visibleRibbons(many, 16);
    assert.equal(desktop.shown.length, 15);
    assert.equal(desktop.hidden, 20);
    assert.deepEqual(desktop.shown, many.slice(0, 15));
    const compact = visibleRibbons(many, 12);
    assert.equal(compact.shown.length, 11);
    assert.equal(compact.hidden, 24);
    assert.equal(compact.shown.length + compact.hidden, many.length);
});
