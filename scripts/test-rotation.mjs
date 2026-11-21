import assert from 'node:assert/strict';
import test from 'node:test';
const { dayNumber, todaysReferences, serverToday } = await import('../lib/rotation.ts');
const { default: emotions } = await import('../data/emotions.json', { with: { type: 'json' } });

const refs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

test('day 0 shows the original four and More shows the rest', () => {
  assert.deepEqual(todaysReferences(refs, 0), ['a', 'b', 'c', 'd']);
  assert.deepEqual(todaysReferences(refs, 0, true), ['e', 'f', 'g', 'h']);
});

test('each day shifts the window by one and wraps around', () => {
  assert.deepEqual(todaysReferences(refs, 1), ['b', 'c', 'd', 'e']);
  assert.deepEqual(todaysReferences(refs, 6), ['g', 'h', 'a', 'b']);
  assert.deepEqual(todaysReferences(refs, 6, true), ['c', 'd', 'e', 'f']);
  assert.deepEqual(todaysReferences(refs, 8), todaysReferences(refs, 0));
});

test('today and More together always cover every reference exactly once', () => {
  for (let day = 0; day < 16; day++) {
    const all = [...todaysReferences(refs, day), ...todaysReferences(refs, day, true)];
    assert.deepEqual([...all].sort(), refs);
  }
});

test('short lists show everything with nothing more', () => {
  assert.deepEqual(todaysReferences(['a', 'b'], 5), ['a', 'b']);
  assert.deepEqual(todaysReferences(['a', 'b'], 5, true), []);
});

test('every curated feeling has eight distinct references to rotate', () => {
  for (const emotion of emotions) for (const specific of emotion.specifics) assert.equal(new Set(specific.references).size, 8, specific.id);
});

test('day numbers and the pinned test day', () => {
  assert.equal(dayNumber('1970-01-02'), 1);
  assert.equal(dayNumber('2026-11-19') % 8, 0);
  const previous = process.env.VERSELIGHT_TODAY;
  process.env.VERSELIGHT_TODAY = '2026-11-19';
  assert.equal(serverToday(new Date('2030-01-01T00:00:00Z')), '2026-11-19');
  process.env.VERSELIGHT_TODAY = 'nonsense';
  assert.equal(serverToday(new Date('2030-01-01T12:00:00Z')), '2030-01-01');
  if (previous === undefined) delete process.env.VERSELIGHT_TODAY; else process.env.VERSELIGHT_TODAY = previous;
});
