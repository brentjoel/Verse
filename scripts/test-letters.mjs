import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { parseLetters, addLetter, removeLetter, splitLetters, MAX_LETTERS } = await import('../lib/letters.ts');

const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const letter = (n, openOn = '2026-12-01', text = 'Hello') => ({ id: id(n), writtenOn: '2026-11-01', openOn, text });

test('adding trims text and needs a day after today', () => {
  const ok = addLetter([], '  Be brave.  ', '2026-12-01', '2026-11-21', id(1));
  assert.equal(ok.ok, true);
  assert.equal(ok.letters[0].text, 'Be brave.');
  for (const date of ['2026-11-21', '2026-11-20', 'soon', '2026-02-30']) assert.equal(addLetter([], 'x', date, '2026-11-21', id(1)).ok, false);
  assert.equal(addLetter([], '   ', '2026-12-01', '2026-11-21', id(1)).ok, false);
  assert.equal(addLetter([], 'x'.repeat(2001), '2026-12-01', '2026-11-21', id(1)).ok, false);
});
test('the list is capped', () => {
  const full = Array.from({ length: MAX_LETTERS }, (_, n) => letter(n + 1));
  assert.equal(addLetter(full, 'x', '2026-12-01', '2026-11-21', id(99)).ok, false);
});
test('splitting keeps sealed text out of the result', () => {
  const { opened, sealed } = splitLetters([letter(1, '2026-11-20', 'secret old'), letter(2, '2026-12-25', 'secret new'), letter(3, '2026-11-21', 'today')], '2026-11-21');
  assert.deepEqual(opened.map(l => l.text), ['today', 'secret old']);
  assert.equal(sealed.length, 1);
  assert.equal('text' in sealed[0], false);
});
test('stored data is validated', () => {
  const good = letter(1);
  assert.deepEqual(parseLetters([good, good, { ...good, id: 'nope' }, { ...good, id: id(2), extra: 1 }, { ...good, id: id(3), openOn: '2026-10-01' }, { ...good, id: id(4), text: '  ' }, 5, null]), [good]);
  for (const bad of [null, {}, 'x', 5]) assert.deepEqual(parseLetters(bad), []);
});
test('removing drops one letter', () => assert.deepEqual(removeLetter([letter(1), letter(2)], id(1)).map(l => l.id), [id(2)]));
