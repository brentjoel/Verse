import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { breathePatterns, cycleSeconds, findPattern, momentAt } = await import('../lib/breathe.ts');

const calm = findPattern('calm');

test('the calm pattern runs 14 seconds a round', () => assert.equal(cycleSeconds(calm), 14));

test('time maps to phase and whole seconds left', () => {
  assert.deepEqual([momentAt(calm, 0).step.phase, momentAt(calm, 0).secondsLeft], ['in', 4]);
  assert.deepEqual([momentAt(calm, 3999).step.phase, momentAt(calm, 3999).secondsLeft], ['in', 1]);
  assert.deepEqual([momentAt(calm, 4000).step.phase, momentAt(calm, 4000).secondsLeft], ['hold', 4]);
  assert.deepEqual([momentAt(calm, 8000).step.phase, momentAt(calm, 8000).secondsLeft], ['out', 6]);
});

test('rounds advance after each full cycle', () => {
  assert.equal(momentAt(calm, 13999).round, 1);
  const next = momentAt(calm, 14000);
  assert.deepEqual([next.round, next.step.phase, next.secondsLeft], [2, 'in', 4]);
});

test('bad elapsed time counts as the start', () => {
  for (const bad of [-5, NaN, Infinity * -1]) assert.equal(momentAt(calm, bad).step.phase, 'in');
});

test('unknown ids fall back to the first pattern and every step has time', () => {
  assert.equal(findPattern('nope').id, breathePatterns[0].id);
  for (const pattern of breathePatterns) for (const step of pattern.steps) assert.ok(step.seconds > 0);
});
