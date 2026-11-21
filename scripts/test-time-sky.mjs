import assert from 'node:assert/strict';
import test from 'node:test';
const { skyPhase } = await import('../lib/time-sky.ts');

test('hours map to the four phases', () => {
  const phases = Array.from({ length: 24 }, (_, hour) => skyPhase(hour));
  assert.deepEqual(phases.slice(0, 5), Array(5).fill('night'));
  assert.deepEqual(phases.slice(5, 8), Array(3).fill('dawn'));
  assert.deepEqual(phases.slice(8, 17), Array(9).fill('day'));
  assert.deepEqual(phases.slice(17, 20), Array(3).fill('dusk'));
  assert.deepEqual(phases.slice(20), Array(4).fill('night'));
});
test('bad hours fall back to night', () => {
  for (const bad of [-1, 24, 3.5, NaN, undefined]) assert.equal(skyPhase(bad), 'night');
});
