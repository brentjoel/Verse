import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { buildNightSky } = await import('../lib/night-sky.ts');

const day = (localDate, sources = ['emotion']) => ({ localDate, firstActivityAt: `${localDate}T09:00:00.000Z`, utcOffsetMinutes: 0, sources });
const mood = (localDate, emotionId, minute = 0) => ({ id: `${localDate}-${minute}`, emotionId, specificEmotionId: 'x', localDate, createdAt: `${localDate}T09:${String(minute).padStart(2, '0')}:00.000Z` });

test('each active day in the month is one star, in date order, inside the sky', () => {
  const sky = buildNightSky('2026-11-01', '2026-11-30', [day('2026-11-03'), day('2026-11-01'), day('2026-10-31'), day('2026-12-01')], [], []);
  assert.deepEqual(sky.stars.map(star => star.date), ['2026-11-01', '2026-11-03']);
  for (const star of sky.stars) {
    assert.ok(star.x >= 4 && star.x <= 96);
    assert.ok(star.y >= 18 && star.y <= 82);
  }
  assert.equal(sky.stars[0].x, 4);
});

test('positions are stable across calls', () => {
  const a = buildNightSky('2026-11-01', '2026-11-30', [day('2026-11-12')], [], []);
  const b = buildNightSky('2026-11-01', '2026-11-30', [day('2026-11-12')], [], []);
  assert.deepEqual(a, b);
});

test('a star takes the colour of the latest reflection and counts them', () => {
  const sky = buildNightSky('2026-11-01', '2026-11-30', [day('2026-11-05')], [mood('2026-11-05', 'sad', 1), mood('2026-11-05', 'grateful', 9)], []);
  assert.equal(sky.stars[0].emotionId, 'grateful');
  assert.equal(sky.stars[0].reflections, 2);
});

test('a save-only visit is a plain star with no colour', () => {
  const sky = buildNightSky('2026-11-01', '2026-11-30', [day('2026-11-05', ['save'])], [], []);
  assert.equal(sky.stars[0].emotionId, undefined);
  assert.equal(sky.stars[0].reflections, 0);
});

test('consecutive days link; a grace day bridges with a dim link; other gaps break', () => {
  const days = ['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-08'].map(date => day(date));
  const sky = buildNightSky('2026-11-01', '2026-11-30', days, [], ['2026-11-04']);
  assert.deepEqual(sky.links, [
    { from: '2026-11-02', to: '2026-11-03', grace: false },
    { from: '2026-11-03', to: '2026-11-05', grace: true },
  ]);
  assert.deepEqual(sky.graceDates, ['2026-11-04']);
});

test('an empty month is an empty sky', () => {
  assert.deepEqual(buildNightSky('2026-02-01', '2026-02-28', [], [], []), { stars: [], links: [], graceDates: [] });
});
