import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const { parsePrayers, addPrayer, setAnswered, removePrayer, splitPrayers, MAX_PRAYERS, MAX_PRAYER_LENGTH } = await import('../lib/prayers.ts');
const { PersonalStore, readBackup } = await import('../lib/storage.ts');
const { emptyData, validatePersonalData } = await import('../lib/storage-schema.ts');

const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const prayer = (n, addedOn = '2026-11-01', answeredOn) => ({ id: id(n), text: `Prayer ${n}`, addedOn, ...(answeredOn ? { answeredOn } : {}) });

test('adding trims, checks length and caps the list', () => {
  const added = addPrayer([], '  For my sister  ', '2026-11-21', id(1));
  assert.deepEqual(added, { ok: true, prayers: [{ id: id(1), text: 'For my sister', addedOn: '2026-11-21' }] });
  assert.equal(addPrayer([], '   ', '2026-11-21', id(1)).ok, false);
  assert.equal(addPrayer([], 'x'.repeat(MAX_PRAYER_LENGTH + 1), '2026-11-21', id(1)).ok, false);
  assert.equal(addPrayer(Array.from({ length: MAX_PRAYERS }, (_, i) => prayer(i)), 'one more', '2026-11-21', id(999)).ok, false);
});

test('answering keeps the date, undo clears it, and answers never predate the prayer', () => {
  const list = [prayer(1, '2026-11-01'), prayer(2, '2026-11-25')];
  const answered = setAnswered(list, id(1), true, '2026-11-21');
  assert.equal(answered[0].answeredOn, '2026-11-21');
  assert.equal(setAnswered(list, id(2), true, '2026-11-21')[1].answeredOn, '2026-11-25');
  assert.equal(Object.hasOwn(setAnswered(answered, id(1), false, '2026-11-21')[0], 'answeredOn'), false);
  assert.deepEqual(removePrayer(answered, id(1)).map(p => p.id), [id(2)]);
});

test('split puts still-praying oldest first and answered newest first', () => {
  const { open, answered } = splitPrayers([prayer(1, '2026-11-05'), prayer(2, '2026-11-01'), prayer(3, '2026-10-01', '2026-11-02'), prayer(4, '2026-10-01', '2026-11-09')]);
  assert.deepEqual(open.map(p => p.id), [id(2), id(1)]);
  assert.deepEqual(answered.map(p => p.id), [id(4), id(3)]);
});

test('untrusted records are dropped', () => {
  assert.deepEqual(parsePrayers('nope'), []);
  assert.deepEqual(parsePrayers([prayer(1), prayer(1), { ...prayer(2), extra: 1 }, { ...prayer(3), text: ' padded ' }, prayer(4, '2026-11-05', '2026-11-01'), { ...prayer(5), addedOn: '2026-02-30' }]).map(p => p.id), [id(1)]);
});

test('prayers round trip through the store and backup, and corrupted ones are rejected', async () => {
  const port = { raw: null, read() { return this.raw; }, write(v) { this.raw = v; } };
  const store = new PersonalStore(port, () => {}, () => ({ localDate: '2026-11-21', instant: '2026-11-21T12:00:00.000Z', utcOffsetMinutes: 0 }));
  store.initialize();
  assert.equal((await store.setCompanion({ prayers: [prayer(1, '2026-11-01', '2026-11-21')] })).ok, true);
  assert.deepEqual(readBackup(store.exportBackup()).data.prayers, [prayer(1, '2026-11-01', '2026-11-21')]);
  const base = emptyData({ theme: 'dark', preferredTranslation: 'web' });
  assert.doesNotThrow(() => validatePersonalData(base), 'older version 2 data without prayers stays valid');
  for (const bad of [[prayer(1), prayer(1)], [{ ...prayer(1), text: '' }], 'x', [{ ...prayer(1), answeredOn: '2026-10-01' }]]) {
    assert.throws(() => validatePersonalData({ ...base, prayers: bad }));
  }
  assert.equal((await store.setCompanion({ prayers: [{ ...prayer(1), text: '' }] })).ok, false);
});
