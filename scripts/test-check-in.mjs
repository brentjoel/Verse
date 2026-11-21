import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { pickCheckIn, parseDismissed } = await import('../lib/check-in.ts');

const mood = (localDate, emotionId, minute = 0) => ({ id: `${localDate}-${minute}`, emotionId, specificEmotionId: 'x', localDate, createdAt: `${localDate}T09:${String(minute).padStart(2, '0')}:00.000Z` });

test('no reflections means no card', () => assert.equal(pickCheckIn([], '2026-11-21'), undefined));
test('a reflection from an earlier day shows, using the latest one', () => {
  assert.equal(pickCheckIn([mood('2026-11-18', 'sad'), mood('2026-11-19', 'tired', 5), mood('2026-11-19', 'angry', 2)], '2026-11-21').emotionId, 'tired');
});
test('a reflection from today hides the card, even if older ones exist', () => {
  assert.equal(pickCheckIn([mood('2026-11-10', 'sad'), mood('2026-11-21', 'tired')], '2026-11-21'), undefined);
});
test('dismissing hides it for that day only', () => {
  const moods = [mood('2026-11-19', 'sad')];
  assert.equal(pickCheckIn(moods, '2026-11-21', '2026-11-21'), undefined);
  assert.ok(pickCheckIn(moods, '2026-11-22', '2026-11-21'));
});
test('a bad today value shows nothing', () => assert.equal(pickCheckIn([mood('2026-11-19', 'sad')], 'oops'), undefined));
test('stored dismissal is validated', () => {
  assert.equal(parseDismissed('2026-11-21'), '2026-11-21');
  for (const bad of [null, '', 'yes', '2026-13-40', {}, 5]) assert.equal(parseDismissed(bad), undefined);
});
