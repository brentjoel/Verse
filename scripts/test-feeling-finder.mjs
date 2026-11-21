import assert from 'node:assert/strict';
import test from 'node:test';
const { FINDER_QUESTIONS, suggestFeelings } = await import('../lib/feeling-finder.ts');
const { default: emotions } = await import('../data/emotions.json', { with: { type: 'json' } });
const order = emotions.map(emotion => emotion.id);

test('every option leans only toward real feelings', () => {
  for (const question of FINDER_QUESTIONS) for (const option of question.options) {
    assert.ok(option.leans.length >= 1);
    for (const id of option.leans) assert.ok(order.includes(id), `${id} is not a feeling`);
  }
});
test('every feeling can come out on top', () => {
  const tops = new Set();
  const [q1, q2, q3] = FINDER_QUESTIONS;
  for (let a = 0; a < q1.options.length; a++) for (let b = 0; b < q2.options.length; b++) for (let c = 0; c < q3.options.length; c++) tops.add(suggestFeelings([a, b, c], order)[0]);
  for (const id of order) assert.ok(tops.has(id), `${id} is unreachable`);
});
test('answers that agree give a clear first suggestion', () => {
  assert.equal(suggestFeelings([0, 4, 5], order)[0], 'doubtful');
  assert.equal(suggestFeelings([4, 5, 6], order)[0], 'grateful');
  assert.equal(suggestFeelings([3, 6, 0], order)[0], 'tired');
});
test('at most two, no duplicates, and missing answers are ignored', () => {
  const result = suggestFeelings([2, 2, 2], order);
  assert.ok(result.length <= 2 && new Set(result).size === result.length);
  assert.deepEqual(suggestFeelings([], order), []);
  assert.deepEqual(suggestFeelings([99, -1, 0.5], order), []);
});
test('ties keep the feeling order', () => assert.deepEqual(suggestFeelings([0], order, [FINDER_QUESTIONS[0]]), ['anxious', 'doubtful']));
