import assert from 'node:assert/strict';
import test from 'node:test';
const { parseLastVerse, lastVerseKey } = await import('../lib/last-verse.ts');

test('a stored index inside the range is used', () => {
  assert.equal(parseLastVerse('2', 4), 2);
  assert.equal(parseLastVerse('0', 4), 0);
  assert.equal(parseLastVerse('3', 4), 3);
});

test('missing, malformed or out-of-range values fall back to the first verse', () => {
  for (const raw of [null, undefined, '', '4', '99', '-1', '1.5', 'abc', '1e2', ' 2', '0002x']) assert.equal(parseLastVerse(raw, 4), 0, String(raw));
  assert.equal(parseLastVerse('1', 0), 0);
});

test('keys are namespaced per page', () => {
  assert.notEqual(lastVerseKey('/emotions/sad/lonely'), lastVerseKey('/emotions/sad/lonely?more'));
});
