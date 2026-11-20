import assert from 'node:assert/strict';
import test from 'node:test';
import { wrapIndex } from '../lib/wheel.ts';
import emotions from '../data/emotions.json' with { type: 'json' };

test('detents wrap backwards and forwards across both wheel levels', () => {
  for (const count of [emotions.length, ...emotions.map(emotion => emotion.specifics.length)]) {
    assert.equal(wrapIndex(-1, count), count - 1);
    assert.equal(wrapIndex(count, count), 0);
    assert.equal(wrapIndex(count * 3 + 1, count), 1);
  }
  assert.equal(wrapIndex(5, 0), 0);
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

test('constellation geometry is deterministic, banded by sector and bounded', async () => {
  const { buildConstellation } = await import('../lib/constellation.ts');
  const a = buildConstellation(1000, 8, 7);
  const b = buildConstellation(1000, 8, 7);
  assert.equal(a.positions.length, 3000); assert.equal(a.sector.length, 1000); assert.equal(a.size.length, 1000); assert.equal(a.phase.length, 1000);
  assert.deepEqual([...a.positions], [...b.positions]);
  assert.notDeepEqual([...buildConstellation(1000, 8, 8).positions], [...a.positions]);
  let halo = 0;
  for (let i = 0; i < 1000; i++) {
    const s = a.sector[i];
    if (s === -1) halo++; else assert.ok(Number.isInteger(s) && s >= 0 && s <= 7);
    const r = Math.hypot(a.positions[i * 3], a.positions[i * 3 + 1]);
    assert.ok(s === -1 ? r >= 1.7 && r <= 2.3 : r >= 0.95 && r <= 1.75, `radius ${r} sector ${s}`);
    assert.ok(a.size[i] > 0 && a.phase[i] >= 0 && a.phase[i] < Math.PI * 2);
  }
  assert.ok(halo >= 90 && halo <= 150, `halo ${halo}`);
  const spread = [...a.sector].map((s, i) => s >= 0 ? Math.hypot(a.positions[i * 3], a.positions[i * 3 + 1]) : null).filter(r => r !== null);
  assert.ok(Math.max(...spread) - Math.min(...spread) > 0.55, 'band is thick enough to read as a cloud');
});
