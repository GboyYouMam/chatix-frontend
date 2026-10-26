import assert from 'node:assert/strict';
import test from 'node:test';
import { contrastRatio } from '../src/lib/contrast.ts';
import {
    DEFAULT_ROOM_THEME,
    ROOM_THEME_KEYS,
    ROOM_THEMES,
    isThemeOwned,
    roomThemeOf,
    themeItemKey,
} from '../src/themes/roomThemes.ts';

const REQUIRED_VARS = [
    '--room-bg',
    '--room-surface',
    '--room-text',
    '--room-muted',
    '--room-accent',
    '--room-border',
    '--room-font-heading',
    '--room-font-body',
    '--room-pattern',
];

test('every theme defines the full variable set, colours as HEX', () => {
    for (const key of ROOM_THEME_KEYS) {
        for (const name of REQUIRED_VARS) {
            assert.ok(ROOM_THEMES[key][name], `${key} is missing ${name}`);
        }
        for (const name of [
            '--room-bg',
            '--room-surface',
            '--room-text',
            '--room-muted',
            '--room-accent',
            '--room-border',
        ]) {
            assert.match(ROOM_THEMES[key][name], /^#[0-9a-f]{6}$/i, `${key} ${name}`);
        }
    }
});

test('body text meets WCAG AA (4.5:1) on every surface of every theme', () => {
    for (const key of ROOM_THEME_KEYS) {
        const vars = ROOM_THEMES[key];
        for (const surface of ['--room-bg', '--room-surface']) {
            for (const text of ['--room-text', '--room-muted']) {
                const ratio = contrastRatio(vars[text], vars[surface]);
                assert.ok(ratio >= 4.5, `${key}: ${text} on ${surface} is ${ratio.toFixed(2)}`);
            }
        }
        const accent = contrastRatio(vars['--room-accent'], vars['--room-bg']);
        assert.ok(accent >= 4.5, `${key}: accent on bg is ${accent.toFixed(2)}`);
    }
});

test('contrast helper matches WCAG reference values', () => {
    assert.equal(Math.round(contrastRatio('#000000', '#ffffff') * 100) / 100, 21);
    assert.equal(Math.round(contrastRatio('#777777', '#777777') * 100) / 100, 1);
});

test('unknown or missing theme keys fall back to basement', () => {
    assert.equal(roomThemeOf(undefined), DEFAULT_ROOM_THEME);
    assert.equal(roomThemeOf('sparkle_pony'), 'basement');
    assert.equal(roomThemeOf('win98'), 'win98');
});

test('basement is free, every other theme needs its shop item', () => {
    assert.equal(themeItemKey('basement'), null);
    assert.equal(themeItemKey('fight_club'), 'theme_fight_club');
    assert.equal(isThemeOwned('basement', new Set()), true);
    assert.equal(isThemeOwned('win98', new Set()), false);
    assert.equal(isThemeOwned('win98', new Set(['theme_win98'])), true);
});
