import test from 'node:test';
import assert from 'node:assert/strict';

const { formatDay, formatMonth } = await import('../lib/dates.ts');

test('local calendar dates format without timezone drift', () => {
  assert.equal(formatDay('2026-11-20', 'en-GB'), '20 November');
  assert.equal(formatDay('2026-01-01', 'en-US', true), 'January 1, 2026');
  assert.equal(formatDay('2026-11-20T23:59:59.000Z', 'en-GB'), '20 November');
  assert.equal(formatMonth('2026-11', 'en-US'), 'November 2026');
  assert.equal(formatMonth('2024-02-01', 'en-GB'), 'February 2024');
});

test('invalid input falls back to the stored text', () => {
  assert.equal(formatDay('not-a-date', 'en-US'), 'not-a-date');
  assert.equal(formatMonth('2026-13', 'en-US'), '2026-13');
});
