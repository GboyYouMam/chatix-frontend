import assert from 'node:assert/strict';
import test from 'node:test';
import {
    auraTrend,
    isPlayableNowPlaying,
    isSafeEmbedUrl,
    debtPercent,
    moveItem,
    padVisitor,
    relativeAgo,
} from '../src/components/widgets/widgetMath.ts';

test('moveItem swaps with the neighbour and keeps the list intact at the edges', () => {
    assert.deepEqual(moveItem(['a', 'b', 'c'], 1, -1), ['b', 'a', 'c']);
    assert.deepEqual(moveItem(['a', 'b', 'c'], 1, 1), ['a', 'c', 'b']);
    assert.deepEqual(moveItem(['a', 'b', 'c'], 0, -1), ['a', 'b', 'c']);
    assert.deepEqual(moveItem(['a', 'b', 'c'], 2, 1), ['a', 'b', 'c']);
});

test('moveItem does not mutate the source list', () => {
    const source = ['a', 'b'];
    moveItem(source, 0, 1);
    assert.deepEqual(source, ['a', 'b']);
});

test('auraTrend compares the last two days, including string aura from the api', () => {
    assert.deepEqual(auraTrend([{ aura: 100 }, { aura: 88 }]), { pct: -12, direction: 'down' });
    assert.deepEqual(auraTrend([{ aura: '100' }, { aura: '150' }]), { pct: 50, direction: 'up' });
    assert.deepEqual(auraTrend([{ aura: 0 }, { aura: 40 }]), { pct: 100, direction: 'up' });
    assert.deepEqual(auraTrend([{ aura: 5 }, { aura: 5 }]), { pct: 0, direction: 'flat' });
    assert.deepEqual(auraTrend([{ aura: 5 }]), { pct: 0, direction: 'flat' });
});

test('debtPercent is debt over 1000 capped at 100, never negative', () => {
    assert.equal(debtPercent(730), 73);
    assert.equal(debtPercent(1000), 100);
    assert.equal(debtPercent(25_000), 100);
    assert.equal(debtPercent(-400), 0);
    assert.equal(debtPercent(0), 0);
});

test('padVisitor pads the odometer to seven digits', () => {
    assert.equal(padVisitor(420), '0000420');
    assert.equal(padVisitor(12_345_678), '12345678');
    assert.equal(padVisitor(-3), '0000000');
});

test('relativeAgo turns a timestamp into a short lowercase age', () => {
    const now = Date.parse('2026-10-27T12:00:00Z');
    assert.equal(relativeAgo('2026-10-27T11:59:50Z', now), 'just now');
    assert.equal(relativeAgo('2026-10-27T11:30:00Z', now), '30m ago');
    assert.equal(relativeAgo('2026-10-27T09:00:00Z', now), '3h ago');
    assert.equal(relativeAgo('2026-10-24T12:00:00Z', now), '3d ago');
    assert.equal(relativeAgo('not a date', now), '');
});

test('only real spotify and soundcloud player urls render as iframes', () => {
    assert.equal(
        isSafeEmbedUrl('spotify', 'https://open.spotify.com/embed/track/abc123?theme=0'),
        true,
    );
    assert.equal(
        isSafeEmbedUrl('soundcloud', 'https://w.soundcloud.com/player/?url=x&auto_play=false'),
        true,
    );
    assert.equal(
        isSafeEmbedUrl('spotify', 'https://open.spotify.com.evil.com/embed/track/abc'),
        false,
    );
    assert.equal(isSafeEmbedUrl('spotify', 'javascript:alert(1)'), false);
    assert.equal(isSafeEmbedUrl('spotify', 'http://open.spotify.com/embed/track/abc'), false);
    assert.equal(isSafeEmbedUrl('spotify', 'https://open.spotify.com/track/abc'), false);
    assert.equal(isSafeEmbedUrl('soundcloud', 'https://open.spotify.com/embed/track/abc'), false);
    assert.equal(isPlayableNowPlaying(null), false);
    assert.equal(
        isPlayableNowPlaying({
            provider: 'spotify',
            embedUrl: 'https://open.spotify.com/embed/track/abc',
        }),
        true,
    );
});
