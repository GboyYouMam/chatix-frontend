import assert from 'node:assert/strict';
import test from 'node:test';
import {
    ribbonStyle,
    sortForRack,
    type AchievementDef,
} from '../src/components/achievements/ribbons.ts';

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

test('rack sorts tiers before unlock date and ribbon styles cover every catalog category', () => {
    const ordered = sortForRack(
        catalog.map(({ key }) => ({ key, unlockedAt: '2026-01-01' })),
        catalog,
    );
    assert.deepEqual(
        ordered.map(({ key }) => key),
        ['gold', 'silver', 'bronze', 'secret', 'shame'],
    );
    for (const def of catalog) {
        const style = ribbonStyle(def);
        assert.ok(style.stripes.length > 0, `${def.category} has a palette`);
        assert.ok(style.border);
    }
});

test('ribbon style falls back to a neutral palette for unknown categories', () => {
    const style = ribbonStyle({
        category: 'future_category' as AchievementDef['category'],
        tier: 'bronze',
    });
    assert.ok(style.stripes.length > 0);
    assert.ok(style.background.includes('#71717a'));
});
