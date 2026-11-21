import assert from 'node:assert/strict';
import test from 'node:test';
import { passageTokens, wordDelay, prepareDawn, consumeDawn } from '../lib/dawn.ts';
import { readFileSync } from 'node:fs';

test('word segmentation preserves exact source text for every static translation', () => {
  for (const id of ['web', 'kjv', 'asv', 'bsb']) {
    const entries = JSON.parse(readFileSync(new URL(`../data/verses/${id}.json`, import.meta.url)));
    // Source files contain canonical-reference keyed text strings.
    for (const text of Object.values(entries)) {
      assert.equal(typeof text, 'string');
      assert.equal(passageTokens(text).join(''), text);
    }
  }
  for (const text of ['', '  Synthetic fixture.\n\nOne\tword\u00a0next.  ', '“Fixture,” test!']) {
    assert.equal(passageTokens(text).join(''), text);
  }
});

test('reading cadence starts after the light and advances at 260ms per word', () => {
  assert.equal(wordDelay(0), 600);
  assert.equal(wordDelay(-1), 600);
  assert.equal(wordDelay(1), 860);
  assert.equal(wordDelay(100) - wordDelay(99), 260);
});

test('wheel intent is consumed once and never replays on unrelated or direct visits', () => {
  assert.equal(consumeDawn('/direct'), false);
  prepareDawn('/selected');
  assert.equal(consumeDawn('/selected'), true);
  assert.equal(consumeDawn('/selected'), false);
  prepareDawn('/selected');
  assert.equal(consumeDawn('/other'), false);
  assert.equal(consumeDawn('/selected'), false);
});

test('each verse and translation gets a fresh full run; rapid changes cancel previous effects', async () => {
  const { createDawnRun } = await import('../lib/dawn.ts');
  let cancelled = 0;
  const effect = () => ({ cancel() { cancelled++; } });
  const first = createDawnRun(); first.add(effect()); first.add(effect());
  first.cancel(); first.cancel();
  assert.equal(cancelled, 2);
  const next = createDawnRun(); next.add(effect());
  assert.equal(next.running, true);
  next.cancel(); // Skip applies only to this run.
  next.add(effect()); // A stale callback cannot leave an overlapping effect.
  assert.equal(cancelled, 4);
  const previous = createDawnRun();
  assert.equal(previous.running, true);
  const translated = createDawnRun();
  previous.cancel();
  assert.equal(translated.running, true);
  translated.cancel();
});

test('undo intent is one-use, path-bound and memory only', async () => {
  const { prepareUndo, consumeUndo } = await import('../lib/dawn.ts');
  prepareUndo('/a', 'x');
  assert.equal(consumeUndo('/b'), undefined);
  assert.equal(consumeUndo('/a'), undefined);
  prepareUndo('/a', 'x');
  assert.equal(consumeUndo('/a'), 'x');
  assert.equal(consumeUndo('/a'), undefined);
});

test('dawn burst stars are deterministic per reference and stay in bounds', async () => {
  const { burstStars } = await import('../lib/dawn.ts');
  const a = burstStars('Psalm 61:2');
  assert.equal(a.length, 16);
  assert.deepEqual(a, burstStars('Psalm 61:2'));
  assert.notDeepEqual(a, burstStars('John 14:27'));
  for (const star of a) {
    assert.ok(star.x >= 0 && star.x <= 100 && star.y >= 0 && star.y <= 100);
    assert.ok(star.delay >= 0 && star.delay <= 600);
    assert.ok(star.size >= 2 && star.size <= 5);
  }
  assert.equal(burstStars('x', 4).length, 4);
});
