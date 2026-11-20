import assert from 'node:assert/strict';
import test from 'node:test';
import { wrapIndex, waveCharacters, waveHeight, needsSimplePicker, isSlowWheel } from '../lib/wheel.ts';
import emotions from '../data/emotions.json' with { type: 'json' };

test('detents wrap backwards and forwards across both wheel levels', () => {
  for (const count of [emotions.length, ...emotions.map(emotion => emotion.specifics.length)]) {
    assert.equal(wrapIndex(-1, count), count - 1);
    assert.equal(wrapIndex(count, count), 0);
    assert.equal(wrapIndex(count * 3 + 1, count), 1);
  }
  assert.equal(wrapIndex(5, 0), 0);
});
test('each source emotion has a distinct bounded waveform character', () => {
  assert.deepEqual(Object.keys(waveCharacters).sort(), emotions.map(emotion => emotion.id).sort());
  assert.equal(new Set(Object.values(waveCharacters).map(JSON.stringify)).size, emotions.length);
  for (const character of Object.values(waveCharacters)) {
    assert.match(character.color, /^#[\da-f]{6}$/i);
    for (let i = 0; i < 128; i++) {
      const height = waveHeight(i / 128 * Math.PI * 2, i * .3, character);
      assert.ok(Number.isFinite(height) && height >= .08 && height <= .08 + character.amplitude);
    }
  }
});
test('reduced motion and low capability use simple picker; missing hints allow rendering probe', () => {
  assert.equal(needsSimplePicker(true, 8), true);
  assert.equal(needsSimplePicker(false, 2), true);
  assert.equal(needsSimplePicker(false, undefined), false);
  assert.equal(needsSimplePicker(false, 8), false);
  assert.equal(isSlowWheel(40, 2100), true);
  assert.equal(isSlowWheel(120, 2100), false);
  assert.equal(isSlowWheel(10, 1000), false);
});

const { emotionHues, initialTier, nextTier, leanWeights, tierSettings } = await import('../lib/constellation.ts');

test('every source emotion has a distinct hue pair', () => {
  assert.deepEqual(Object.keys(emotionHues).sort(), emotions.map(e => e.id).sort());
  for (const { night, day } of Object.values(emotionHues)) { assert.match(night, /^#[\da-f]{6}$/i); assert.match(day, /^#[\da-f]{6}$/i); }
  assert.equal(new Set(Object.values(emotionHues).map(h => h.night)).size, 8);
  assert.deepEqual(tierSettings, { high: { particles: 9000, maxDpr: 2 }, medium: { particles: 5000, maxDpr: 1.5 }, low: { particles: 2500, maxDpr: 1 } });
});
test('initial tier respects motion and capability hints', () => {
  assert.equal(initialTier({ reducedMotion: true, cores: 8, width: 1440 }), 'list');
  assert.equal(initialTier({ reducedMotion: false, cores: 2, width: 1440 }), 'list');
  assert.equal(initialTier({ reducedMotion: false, cores: 8, memory: 8, width: 1440 }), 'high');
  assert.equal(initialTier({ reducedMotion: false, cores: 8, memory: 8, width: 390 }), 'medium');
  assert.equal(initialTier({ reducedMotion: false, cores: 4, width: 390 }), 'low');
  assert.equal(initialTier({ reducedMotion: false, memory: 2, width: 1440 }), 'low');
  assert.equal(initialTier({ reducedMotion: false, width: 1440 }), 'high');
});
test('measured fps steps down one tier and falls back only from low', () => {
  assert.equal(nextTier('high', 58), 'high');
  assert.equal(nextTier('high', 40), 'medium');
  assert.equal(nextTier('medium', 40), 'low');
  assert.equal(nextTier('low', 40), 'low');
  assert.equal(nextTier('low', 20), 'list');
  assert.equal(nextTier('high', 20), 'medium');
  assert.equal(nextTier('list', 60), 'list');
});
test('lean weights normalize to the strongest emotion and ignore junk', () => {
  const order = emotions.map(e => e.id);
  assert.deepEqual(leanWeights({}, order), order.map(() => 0));
  const w = leanWeights({ anxious: 2, sad: 1, angry: -3, tired: Number.NaN, unknown: 9 }, order);
  assert.equal(w[order.indexOf('anxious')], 1); assert.equal(w[order.indexOf('sad')], .5);
  assert.equal(w[order.indexOf('angry')], 0); assert.equal(w[order.indexOf('tired')], 0);
  assert.equal(w.length, order.length);
});
