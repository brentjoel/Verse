import test from 'node:test';
import assert from 'node:assert/strict';
import { INTRO_KEY, introShouldPlay, magnetOffset, burstRays, feelingTitleName } from '../lib/motion.ts';

test('the first-visit intro has its own key and plays once, on Home, with motion', () => {
  assert.equal(INTRO_KEY, 'verselight-intro');
  assert.equal(introShouldPlay(null, '/', false), true);
  assert.equal(introShouldPlay('seen', '/', false), false, 'shown once');
  assert.equal(introShouldPlay(null, '/', true), false, 'reduced motion never plays it');
  assert.equal(introShouldPlay(null, '/emotions/sad/lonely', false), false, 'never in front of Scripture');
  assert.equal(introShouldPlay('', '/', false), false, 'any stored value counts as seen');
});

test('the intro check inlines into the pre-paint script', () => {
  const inlined = new Function(`return (${introShouldPlay.toString()})(null, '/', false)`);
  assert.equal(inlined(), true);
});

test('magnetic pills lean at most a few pixels toward the pointer', () => {
  const rect = { left: 100, top: 100, width: 200, height: 48 };
  assert.deepEqual(magnetOffset(200, 124, rect), { x: 0, y: 0 });
  assert.deepEqual(magnetOffset(300, 148, rect), { x: 3, y: 1.8 });
  assert.deepEqual(magnetOffset(0, 0, rect), { x: -3, y: -1.8 }, 'outside the box is clamped');
  assert.deepEqual(magnetOffset(150, 124, rect, 4), { x: -2, y: 0 });
  assert.deepEqual(magnetOffset(10, 10, { left: 0, top: 0, width: 0, height: 0 }), { x: 0, y: 0 });
});

test('star bursts are stable and stay small', () => {
  const rays = burstRays();
  assert.equal(rays.length, 7);
  assert.deepEqual(rays, burstRays());
  for (const ray of rays) { assert.ok(ray.distance <= 28 && ray.size <= 5); }
});

test('shared title names are unique per feeling', () => {
  assert.equal(feelingTitleName('sad', 'lonely'), 'feeling-sad-lonely');
  assert.notEqual(feelingTitleName('sad', 'lonely'), feelingTitleName('sad', 'grieving'));
});
