import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, nextResolve) {
  return nextResolve(specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier) ? `${specifier}.ts` : specifier, context);
} });
const lockLib = await import('../lib/journal-lock.ts');
const { newLockKey, seal, unlock, validLock, secretOf, withoutSecret, withSecret, hasSecret } = lockLib;
const { PersonalStore, readBackup } = await import('../lib/storage.ts');
const { emptyData, validatePersonalData } = await import('../lib/storage-schema.ts');
const { default: emotions } = await import('../data/emotions.json', { with: { type: 'json' } });

const emotion = emotions[0]; const feeling = emotion.specifics[0];
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const NOTE = 'TEST_PRIVATE_NOTE'; const LETTER = 'TEST_PRIVATE_LETTER'; const PRAYER = 'TEST_PRIVATE_PRAYER';
const clock = () => ({ localDate: '2026-11-21', instant: '2026-11-21T12:00:00.000Z', utcOffsetMinutes: 0 });
function port(raw = null) { return { raw, read() { return this.raw; }, write(v) { this.raw = v; } }; }
const plain = text => [NOTE, LETTER, PRAYER].some(secret => text.includes(secret));

async function journal() {
  const p = port(); const store = new PersonalStore(p, () => {}, clock); store.initialize();
  await store.recordMood(emotion.id, feeling.id, id(1));
  await store.editMood(id(1), NOTE);
  await store.setCompanion({ letters: [{ id: id(2), writtenOn: '2026-11-21', openOn: '2026-12-21', text: LETTER }], prayers: [{ id: id(3), text: PRAYER, addedOn: '2026-11-21' }] });
  return { p, store };
}

test('seal and unlock round trip; a wrong passcode is refused; the shape is checked', async () => {
  const key = await newLockKey('correct horse', 100_000);
  const secret = { notes: { [id(1)]: NOTE }, letters: [], prayers: [] };
  const lock = await seal(secret, key);
  assert.ok(validLock(lock));
  assert.ok(!JSON.stringify(lock).includes(NOTE));
  assert.deepEqual((await unlock(lock, 'correct horse')).secret, secret);
  await assert.rejects(unlock(lock, 'wrong horse'), /did not open/);
  await assert.rejects(newLockKey('short'), /at least 6/);
  for (const bad of [{ ...lock, version: 2 }, { ...lock, iv: 'AAAA' }, { ...lock, salt: '***' }, { ...lock, iterations: 10 }, { ...lock, data: '' }, { ...lock, extra: 1 }]) assert.equal(validLock(bad), false);
  assert.throws(() => validatePersonalData({ ...emptyData({ theme: 'dark', preferredTranslation: 'web' }), lock: { ...lock, iv: 'AAAA' } }));
});

test('private text splits out and merges back by reflection id', () => {
  const data = { moodEntries: [{ id: id(1), note: NOTE }, { id: id(9) }], letters: [{ id: id(2), writtenOn: '2026-11-21', openOn: '2026-12-21', text: LETTER }], prayers: [{ id: id(3), text: PRAYER, addedOn: '2026-11-21' }] };
  const secret = secretOf(data);
  const stripped = withoutSecret(data);
  assert.equal(hasSecret(stripped), false);
  assert.ok(!plain(JSON.stringify(stripped)));
  assert.deepEqual(withSecret(stripped, secret), data);
});

test('setting a passcode stores and exports no plain private text; a reload starts locked', async () => {
  const { p, store } = await journal();
  assert.ok(plain(p.raw));
  assert.equal((await store.setPasscode('my secret words')).ok, true);
  assert.ok(!plain(p.raw), 'stored data has no plain notes, letters or prayers');
  assert.equal(store.isLocked(), false, 'still open in this tab');
  assert.equal(store.getSnapshot().envelope.data.moodEntries[0].note, NOTE);
  const exported = store.exportBackup();
  assert.ok(!plain(exported), 'export keeps locked text encrypted');
  assert.ok(readBackup(exported).data.lock);

  const reloaded = new PersonalStore(port(p.raw), () => {}, clock); reloaded.initialize();
  assert.equal(reloaded.isLocked(), true);
  assert.equal(reloaded.getSnapshot().envelope.data.moodEntries.length, 1, 'feelings and dates stay readable');
  assert.equal((await reloaded.unlockJournal('not it at all')).ok, false);
  assert.equal((await reloaded.unlockJournal('my secret words')).ok, true);
  const data = reloaded.getSnapshot().envelope.data;
  assert.equal(data.moodEntries[0].note, NOTE);
  assert.equal(data.letters[0].text, LETTER);
  assert.equal(data.prayers[0].text, PRAYER);
});

test('while open, edits are re-sealed; while locked, private edits are refused and others work', async () => {
  const { p, store } = await journal();
  await store.setPasscode('my secret words');
  assert.equal((await store.editMood(id(1), 'TEST_PRIVATE_EDIT')).ok, true);
  assert.ok(!p.raw.includes('TEST_PRIVATE_EDIT'));
  store.lockJournal();
  assert.equal(store.isLocked(), true);
  assert.equal(store.getSnapshot().envelope.data.moodEntries[0].note, undefined);
  assert.equal((await store.editMood(id(1), 'TEST_PRIVATE_LOCKED')).ok, false);
  assert.ok(!p.raw.includes('TEST_PRIVATE_LOCKED'));
  assert.equal((await store.recordMood(emotion.id, feeling.id, id(4))).ok, true, 'choosing a feeling still works while locked');
  assert.equal((await store.unlockJournal('my secret words')).ok, true);
  assert.equal(store.getSnapshot().envelope.data.moodEntries.find(m => m.id === id(1)).note, 'TEST_PRIVATE_EDIT');
});

test('removing the passcode stores plainly again; erasing after a forgotten passcode keeps feelings only', async () => {
  const first = await journal();
  await first.store.setPasscode('my secret words');
  assert.equal((await first.store.removePasscode()).ok, true);
  assert.ok(plain(first.p.raw)); assert.equal(JSON.parse(first.p.raw).data.lock, undefined);

  const second = await journal();
  await second.store.setPasscode('my secret words');
  const locked = new PersonalStore(port(second.p.raw), () => {}, clock); locked.initialize();
  assert.equal((await locked.removePasscode()).ok, false, 'removing needs the passcode');
  assert.equal((await locked.eraseLockedText()).ok, true);
  const after = JSON.parse(locked.recoveryText()).data;
  assert.equal(after.lock, undefined); assert.equal(after.moodEntries.length, 1); assert.deepEqual(after.letters, []);
  assert.equal(locked.isLocked(), false);
});

test('importing a sealed backup starts locked; a backup with a lock and plain text is refused', async () => {
  const { store } = await journal();
  await store.setPasscode('my secret words');
  const sealed = readBackup(store.exportBackup());
  const fresh = new PersonalStore(port(), () => {}, clock); fresh.initialize();
  assert.equal((await fresh.importBackup(sealed, fresh.getSnapshot().envelope)).ok, true);
  assert.equal(fresh.isLocked(), true);
  assert.equal((await fresh.unlockJournal('my secret words')).ok, true);
  assert.equal(fresh.getSnapshot().envelope.data.prayers[0].text, PRAYER);
  const mixed = structuredClone(sealed); mixed.data.letters = [{ id: id(7), writtenOn: '2026-11-21', openOn: '2026-12-21', text: LETTER }];
  const other = new PersonalStore(port(), () => {}, clock); other.initialize();
  assert.equal((await other.importBackup(mixed, other.getSnapshot().envelope)).ok, false);
});
