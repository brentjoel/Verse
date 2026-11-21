import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';

registerHooks({ resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return nextResolve(`${specifier}.ts`, context);
  return nextResolve(specifier, context);
} });
const { PersonalStore, readBackup } = await import('../lib/storage.ts');
const { emptyData, validatePersonalData, validateEnvelope, SCHEMA_VERSION } = await import('../lib/storage-schema.ts');
const { foldLegacy, migrate1to2, migrateVersioned, LEGACY_KEYS } = await import('../lib/storage-migrations.ts');

const prefs = { theme: 'dark', preferredTranslation: 'web' };
const clock = () => ({ localDate: '2026-11-21', instant: '2026-11-21T12:00:00.000Z', utcOffsetMinutes: 0 });
const letter = (n, openOn = '2026-12-01') => ({ id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, writtenOn: '2026-11-01', openOn, text: `Letter ${n}` });
const v1Data = () => { const data = emptyData(prefs); delete data.letters; delete data.marks; return data; };
const v1Envelope = () => ({ schemaVersion: 1, revision: 3, updatedAt: '2026-11-20T10:00:00.000Z', data: v1Data() });
const legacy = {
  'verselight-anchor': JSON.stringify({ reference: 'Psalm 46:1' }),
  'verselight-letters': JSON.stringify([letter(1)]),
  'verselight-path': JSON.stringify({ emotionId: 'sad', specificId: 'lonely', startedOn: '2026-11-19' }),
  'verselight-spoke': JSON.stringify(['Psalm 94:19']),
};
function port(raw) {
  return { raw, writes: 0, writeFails: false, read() { return this.raw; }, write(value) { if (this.writeFails) throw new Error('QUOTA'); this.raw = value; this.writes++; } };
}

test('version 2 is current and 1 to 2 adds empty companion lists without touching records', () => {
  assert.equal(SCHEMA_VERSION, 2);
  const original = v1Envelope();
  const migrated = migrateVersioned(original);
  assert.deepEqual(migrated, { ...original, schemaVersion: 2, data: { ...original.data, letters: [], marks: [] } });
  assert.deepEqual(original, v1Envelope(), 'the input is never mutated');
  assert.equal(validateEnvelope(migrated).schemaVersion, 2);
});

test('the 1 to 2 step refuses data that already has version 2 fields or no data object', () => {
  assert.throws(() => migrate1to2({ schemaVersion: 1, data: { ...v1Data(), letters: [] } }));
  assert.throws(() => migrate1to2({ schemaVersion: 1, data: 'nope' }));
  assert.throws(() => migrateVersioned({ schemaVersion: 3, data: {} }));
});

test('version 1 backups still import and version 2 backups round trip with companion records', () => {
  const v1 = { format: 'verselight-backup', schemaVersion: 1, exportedAt: '2026-11-20T10:00:00.000Z', data: v1Data() };
  assert.equal(readBackup(JSON.stringify(v1)).schemaVersion, 2);
  const data = { ...emptyData(prefs), anchor: 'Psalm 46:1', letters: [letter(1)], path: { emotionId: 'sad', specificId: 'lonely', startedOn: '2026-11-19' }, marks: ['Psalm 94:19'] };
  const store = new PersonalStore(port(JSON.stringify({ schemaVersion: 2, revision: 0, updatedAt: '2026-11-20T10:00:00.000Z', data })), () => {}, clock);
  store.initialize();
  const text = store.exportBackup();
  const back = readBackup(text);
  assert.equal(back.data.anchor, 'Psalm 46:1');
  assert.deepEqual(back.data.letters, [letter(1)]);
  assert.deepEqual(back.data.path, data.path);
  assert.deepEqual(back.data.marks, ['Psalm 94:19']);
  assert.doesNotMatch(text, /God is our refuge/, 'references only, never verse text');
});

test('corrupted companion records are rejected', () => {
  const base = emptyData(prefs);
  for (const bad of [
    { ...base, anchor: 'Nope 9:9' }, { ...base, anchor: 7 }, { ...base, letters: [{ ...letter(1), text: '' }] },
    { ...base, letters: [letter(1), letter(1)] }, { ...base, letters: Array.from({ length: 51 }, (_, i) => letter(i + 1)) },
    { ...base, marks: ['Psalm 94:19', 'Psalm 94:19'] }, { ...base, marks: ['Nope 1:1'] },
    { ...base, path: { emotionId: 'sad', specificId: 'nope', startedOn: '2026-11-19' } }, { ...base, verseText: 'x' },
    { ...base, letters: undefined },
  ]) assert.throws(() => validatePersonalData(bad));
});

test('legacy keys fold in, stored values win, and only fully saved keys are cleared', () => {
  const folded = foldLegacy(emptyData(prefs), legacy);
  assert.equal(folded.changed, true);
  assert.equal(folded.data.anchor, 'Psalm 46:1');
  assert.deepEqual(folded.data.letters, [letter(1)]);
  assert.deepEqual(folded.data.marks, ['Psalm 94:19']);
  assert.deepEqual(folded.clear.sort(), [...LEGACY_KEYS].sort());
  const kept = foldLegacy({ ...emptyData(prefs), anchor: 'John 3:16', letters: [letter(2)], marks: ['John 3:16'] }, legacy);
  assert.equal(kept.data.anchor, 'John 3:16');
  assert.deepEqual(kept.data.letters.map(l => l.id), [letter(2).id, letter(1).id]);
  assert.deepEqual(kept.data.marks, ['John 3:16', 'Psalm 94:19']);
  assert.ok(!kept.clear.includes('verselight-anchor'), 'a different anchor is not cleared');
  const full = foldLegacy({ ...emptyData(prefs), letters: Array.from({ length: 50 }, (_, i) => letter(i + 10)) }, { 'verselight-letters': legacy['verselight-letters'] });
  assert.deepEqual(full.clear, [], 'letters that do not fit stay in their key');
  const broken = foldLegacy(emptyData(prefs), { 'verselight-anchor': '{oops', 'verselight-path': '"x"' });
  assert.deepEqual(broken, { data: emptyData(prefs), changed: false, clear: [] });
  assert.doesNotThrow(() => validatePersonalData(folded.data));
});

test('a version 1 store adopts legacy keys once it saves, and blocked or failed writes clear nothing', async () => {
  const p = port(JSON.stringify(v1Envelope()));
  const store = new PersonalStore(p, () => {}, clock);
  store.initialize();
  assert.equal(p.writes, 0, 'loading alone never rewrites the original');
  const clear = await store.adoptLegacy(legacy);
  assert.deepEqual(clear.sort(), [...LEGACY_KEYS].sort());
  const saved = JSON.parse(p.raw);
  assert.equal(saved.schemaVersion, 2);
  assert.equal(saved.data.anchor, 'Psalm 46:1');
  assert.deepEqual(await store.adoptLegacy(legacy), [...LEGACY_KEYS].filter(key => clear.includes(key)), 'already saved keys can be cleared without a write');
  assert.equal(p.writes, 1);

  const blocked = new PersonalStore(port('{broken'), () => {}, clock); blocked.initialize();
  assert.deepEqual(await blocked.adoptLegacy(legacy), []);
  const failing = port(JSON.stringify(v1Envelope())); failing.writeFails = true;
  const quota = new PersonalStore(failing, () => {}, clock); quota.initialize();
  assert.deepEqual(await quota.adoptLegacy(legacy), []);
  assert.deepEqual(JSON.parse(failing.raw), v1Envelope(), 'the original stays when saving fails');
});

test('an unknown future version is left untouched', () => {
  const p = port(JSON.stringify({ ...v1Envelope(), schemaVersion: 9 }));
  const store = new PersonalStore(p, () => {}, clock); store.initialize();
  assert.equal(store.getSnapshot().mode, 'blocked');
  assert.equal(store.recoveryText(), p.raw);
});

test('import and reset fully replace companion records, including an anchor or path the source lacks', async () => {
  const data = { ...emptyData(prefs), anchor: 'Psalm 46:1', path: { emotionId: 'sad', specificId: 'lonely', startedOn: '2026-11-19' }, letters: [letter(1)], marks: ['Psalm 94:19'] };
  const p = port(JSON.stringify({ schemaVersion: 2, revision: 0, updatedAt: '2026-11-20T10:00:00.000Z', data }));
  const store = new PersonalStore(p, () => {}, clock); store.initialize();
  const v1 = readBackup(JSON.stringify({ format: 'verselight-backup', schemaVersion: 1, exportedAt: '2026-11-20T10:00:00.000Z', data: v1Data() }));
  assert.equal((await store.importBackup(v1, store.getSnapshot().envelope)).ok, true);
  const after = JSON.parse(p.raw).data;
  assert.equal(after.anchor, undefined); assert.equal(after.path, undefined); assert.deepEqual(after.letters, []);
  await store.setCompanion({ anchor: 'Psalm 46:1' });
  assert.equal((await store.reset()).ok, true);
  assert.equal(JSON.parse(p.raw).data.anchor, undefined);
});
