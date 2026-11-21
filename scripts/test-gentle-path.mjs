import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { parsePath, dayOfPath, dateOfDay, pathComplete, pathReferences } = await import('../lib/gentle-path.ts');
const known = (e, s) => e === 'sad' && s === 'lonely';

test('seven references, in order', () => assert.deepEqual(pathReferences(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']), ['a', 'b', 'c', 'd', 'e', 'f', 'g']));
test('days count from the start date', () => {
  assert.equal(dayOfPath('2026-11-21', '2026-11-21'), 1);
  assert.equal(dayOfPath('2026-11-21', '2026-11-23'), 3);
  assert.equal(dayOfPath('2026-11-21', '2026-11-27'), 7);
  assert.equal(dayOfPath('2026-11-21', '2026-11-20'), 1);
  assert.equal(dayOfPath('2026-12-30', '2027-01-02'), 4);
});
test('the path completes after day seven', () => {
  assert.equal(pathComplete('2026-11-21', '2026-11-27'), false);
  assert.equal(pathComplete('2026-11-21', '2026-11-28'), true);
  assert.equal(dateOfDay('2026-11-21', 3), '2026-11-23');
});
test('stored path is validated', () => {
  const good = { emotionId: 'sad', specificId: 'lonely', startedOn: '2026-11-21' };
  assert.deepEqual(parsePath(good, known), good);
  for (const bad of [null, [], 'x', { ...good, extra: 1 }, { ...good, specificId: 'nope' }, { ...good, startedOn: '2026-02-30' }, { emotionId: 'sad', specificId: 'lonely' }]) assert.equal(parsePath(bad, known), undefined);
});
