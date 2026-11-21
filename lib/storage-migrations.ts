import { ANCHOR_KEY, parseAnchor } from "./anchor";
import { LETTERS_KEY, MAX_LETTERS, parseLetters } from "./letters";
import { PATH_KEY, parsePath } from "./gentle-path";
import { MAX_MARKS, SPOKE_KEY, parseMarks } from "./spoke";
import { KNOWN_REFERENCES, knownFeeling, object, requireValid, SCHEMA_VERSION, type PersonalData } from "./storage-schema";

export type Migration = (input: Record<string, unknown>) => Record<string, unknown>;
/** 1 to 2: adds the companion records with empty values. Existing records are copied untouched. */
export function migrate1to2(input: Record<string, unknown>): Record<string, unknown> {
  const data = object(input.data, [], Object.keys(Object(input.data)));
  requireValid(!Object.hasOwn(data, "letters") && !Object.hasOwn(data, "marks"), "The data migration could not finish safely.");
  return { ...input, schemaVersion: 2, data: { ...data, letters: [], marks: [] } };
}
// Version 1 is the first released local format. Never guess a migration for an unknown schema.
const migrations: Readonly<Record<number, Migration>> = { 1: migrate1to2 };
export function migrateVersioned(input: unknown, steps = migrations, target = SCHEMA_VERSION): unknown {
  let value = structuredClone(input);
  let record = object(value, ["schemaVersion"], ["format", "exportedAt", "revision", "updatedAt", "data"]);
  requireValid(Number.isSafeInteger(record.schemaVersion) && Number(record.schemaVersion) >= 0 && Number(record.schemaVersion) <= target, "This data version is not supported. Keep the original for a compatible version.");
  while (Number(record.schemaVersion) < target) {
    const version = Number(record.schemaVersion);
    requireValid(Object.hasOwn(steps, version), "There is no migration for this older format. Your original data is unchanged.");
    value = steps[version](structuredClone(record));
    record = object(value, ["schemaVersion"], ["format", "exportedAt", "revision", "updatedAt", "data"]);
    requireValid(record.schemaVersion === version + 1, "The data migration could not finish safely.");
  }
  return value;
}

/** Before version 2 these lived in their own localStorage keys, outside backups. */
export const LEGACY_KEYS = [ANCHOR_KEY, LETTERS_KEY, PATH_KEY, SPOKE_KEY] as const;
export type LegacyKey = typeof LEGACY_KEYS[number];
export type LegacyValues = Partial<Record<LegacyKey, string | null>>;

function json(text: string | null | undefined): unknown {
  if (!text) return undefined;
  try { return JSON.parse(text) as unknown; } catch { return undefined; }
}

/**
 * Folds the old separate keys into version 2 data. Pure: returns new data and the keys that are now
 * fully represented in it, so the caller may remove them once the data is saved. Stored values win;
 * lists are merged. A key that cannot be read, or would not fit, is never listed for removal.
 */
export function foldLegacy(input: PersonalData, legacy: LegacyValues): { data: PersonalData; changed: boolean; clear: LegacyKey[] } {
  const data = structuredClone(input);
  const clear: LegacyKey[] = [];
  let changed = false;
  const anchorRaw = json(legacy[ANCHOR_KEY]);
  const anchor = parseAnchor(anchorRaw, KNOWN_REFERENCES);
  if (anchor) {
    if (data.anchor === undefined) { data.anchor = anchor; changed = true; }
    if (data.anchor === anchor) clear.push(ANCHOR_KEY);
  }
  const letters = parseLetters(json(legacy[LETTERS_KEY]));
  if (letters.length > 0) {
    const ids = new Set(data.letters.map(letter => letter.id));
    const extra = letters.filter(letter => !ids.has(letter.id));
    const room = Math.max(0, MAX_LETTERS - data.letters.length);
    if (extra.length > 0 && room > 0) { data.letters.push(...extra.slice(0, room)); changed = true; }
    if (extra.length <= room) clear.push(LETTERS_KEY);
  }
  const path = parsePath(json(legacy[PATH_KEY]), knownFeeling);
  if (path) {
    if (data.path === undefined) { data.path = path; changed = true; }
    if (JSON.stringify(data.path) === JSON.stringify(path)) clear.push(PATH_KEY);
  }
  const marks = parseMarks(json(legacy[SPOKE_KEY]), KNOWN_REFERENCES);
  if (marks.length > 0) {
    const extra = marks.filter(mark => !data.marks.includes(mark));
    const room = Math.max(0, MAX_MARKS - data.marks.length);
    if (extra.length > 0 && room > 0) { data.marks.push(...extra.slice(0, room)); changed = true; }
    if (extra.length <= room) clear.push(SPOKE_KEY);
  }
  return { data, changed, clear };
}
