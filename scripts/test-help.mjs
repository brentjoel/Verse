import assert from 'node:assert/strict';
import test from 'node:test';
const { showsHelpNote, HELPLINE_URL } = await import('../lib/help.ts');

test('the help note shows for the heavier feelings only', () => {
  for (const id of ['sad', 'anxious', 'doubtful', 'tired']) assert.equal(showsHelpNote(id), true);
  for (const id of ['grateful', 'angry', 'hopeful', 'unknown']) assert.equal(showsHelpNote(id), false);
});

test('the helpline link is the plain directory with no tracking', () => {
  assert.equal(HELPLINE_URL, 'https://findahelpline.com');
});
