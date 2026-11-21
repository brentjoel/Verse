import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { printMonths, printableLetters } = await import('../lib/journal-export.ts');

const mood = (id, localDate, emotionId = 'sad', note) => ({ id, emotionId, specificEmotionId: 'x', localDate, createdAt: `${localDate}T09:00:00.000Z`, ...(note ? { note } : {}) });
const describe = (e) => e === 'ghost' ? undefined : { feeling: 'Lonely', parent: 'Sad' };

test('reflections run oldest first and group by month', () => {
  const months = printMonths([mood('c', '2026-12-02'), mood('a', '2026-11-03'), mood('b', '2026-11-20', 'sad', 'a note')], describe);
  assert.deepEqual(months.map(m => [m.month, m.entries.map(e => e.id)]), [['2026-11', ['a', 'b']], ['2026-12', ['c']]]);
  assert.equal(months[0].entries[1].note, 'a note');
  assert.equal('note' in months[0].entries[0], false);
});
test('unknown feelings are skipped and empty input is empty', () => {
  assert.deepEqual(printMonths([mood('a', '2026-11-03', 'ghost')], describe), []);
  assert.deepEqual(printMonths([], describe), []);
});
test('sealed letters never print', () => {
  const letters = [{ id: '1', writtenOn: '2026-01-01', openOn: '2026-12-25', text: 'later' }, { id: '2', writtenOn: '2026-01-01', openOn: '2026-11-21', text: 'now' }];
  assert.deepEqual(printableLetters(letters, '2026-11-21').map(l => l.text), ['now']);
});
