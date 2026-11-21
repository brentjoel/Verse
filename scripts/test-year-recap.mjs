import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { buildYearRecap, recapYears } = await import('../lib/year-recap.ts');

const day = localDate => ({ localDate, firstActivityAt: `${localDate}T09:00:00.000Z`, utcOffsetMinutes: 0, sources: ['emotion'] });
const mood = (localDate, emotionId, specificEmotionId, minute = 0) => ({ id: `${localDate}-${minute}`, emotionId, specificEmotionId, localDate, createdAt: `${localDate}T09:${String(minute).padStart(2, '0')}:00.000Z` });
const data = {
  activityDays: ['2025-12-31', '2026-01-01', '2026-01-02', '2026-01-03', '2026-03-10', '2026-03-12', '2026-12-31'].map(day),
  moodEntries: [mood('2025-12-31', 'sad', 'lonely'), mood('2026-01-01', 'sad', 'lonely'), mood('2026-01-02', 'anxious', 'overwhelmed'), mood('2026-03-10', 'anxious', 'overwhelmed', 5), mood('2026-03-12', 'sad', 'grieving')],
  savedVerses: [{ createdAt: '2026-02-01T00:00:00.000Z' }, { createdAt: '2025-02-01T00:00:00.000Z' }],
  letters: [{ writtenOn: '2026-05-01' }],
  prayers: [{ addedOn: '2026-01-01', answeredOn: '2026-04-01' }, { addedOn: '2026-01-01' }, { addedOn: '2025-01-01', answeredOn: '2025-03-01' }],
};

test('years with activity are listed newest first', () => assert.deepEqual(recapYears(data), ['2026', '2025']));

test('a year counts only its own days, feelings, saves, prayers and letters', () => {
  const recap = buildYearRecap(data, '2026');
  assert.equal(recap.daysVisited, 6);
  assert.equal(recap.reflections, 4);
  assert.deepEqual(recap.months, [3, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.equal(recap.longestRun, 3, 'Dec 31 of the year before does not extend the run');
  assert.deepEqual(recap.emotions, [{ emotionId: 'sad', count: 2 }, { emotionId: 'anxious', count: 2 }].sort((a, b) => b.count - a.count));
  assert.deepEqual(recap.feelings[0], { emotionId: 'anxious', specificId: 'overwhelmed', count: 2 });
  assert.equal(recap.feelings.length, 3);
  assert.equal(recap.saved, 1);
  assert.equal(recap.prayersAnswered, 1);
  assert.equal(recap.lettersWritten, 1);
});

test('ties go to the feeling chosen most recently, and an empty year is all zeros', () => {
  const recap = buildYearRecap(data, '2026');
  assert.deepEqual(recap.feelings.slice(1).map(f => f.specificId), ['grieving', 'lonely']);
  const empty = buildYearRecap({ activityDays: [], moodEntries: [], savedVerses: [], letters: [] }, '2026');
  assert.equal(empty.daysVisited, 0); assert.equal(empty.longestRun, 0); assert.deepEqual(empty.feelings, []); assert.equal(empty.prayersAnswered, 0);
});
