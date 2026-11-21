import { MAX_NOTE_LENGTH } from "./storage-schema";
import { validLocalDate } from "./streaks";

export const LETTERS_KEY = "verselight-letters";
export const MAX_LETTERS = 50;
export const MAX_LETTER_LENGTH = MAX_NOTE_LENGTH;

export interface Letter { id: string; writtenOn: string; openOn: string; text: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KEYS = ["id", "openOn", "text", "writtenOn"];

function validLetter(value: unknown): value is Letter {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (Object.keys(value).sort().join() !== KEYS.join()) return false;
  const { id, writtenOn, openOn, text } = value as Record<string, unknown>;
  return typeof id === "string" && UUID.test(id) && validLocalDate(writtenOn) && validLocalDate(openOn) && openOn >= writtenOn
    && typeof text === "string" && text.trim().length > 0 && text.length <= MAX_LETTER_LENGTH;
}

/** Browser storage is untrusted: bad records are dropped, duplicates by id are ignored, the list is capped. */
export function parseLetters(raw: unknown): Letter[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const letters: Letter[] = [];
  for (const item of raw) {
    if (!validLetter(item) || seen.has(item.id)) continue;
    seen.add(item.id);
    letters.push({ id: item.id, writtenOn: item.writtenOn, openOn: item.openOn, text: item.text });
    if (letters.length === MAX_LETTERS) break;
  }
  return letters;
}

/** A new letter, or an explanation. The open date must be after today. */
export function addLetter(letters: readonly Letter[], text: string, openOn: string, today: string, id: string): { ok: true; letters: Letter[] } | { ok: false; error: string } {
  const body = text.trim();
  if (!body) return { ok: false, error: "Write a few words first." };
  if (body.length > MAX_LETTER_LENGTH) return { ok: false, error: `Keep it under ${MAX_LETTER_LENGTH} characters.` };
  if (!validLocalDate(openOn) || openOn <= today) return { ok: false, error: "Choose a day after today." };
  if (letters.length >= MAX_LETTERS) return { ok: false, error: "That is a lot of letters. Remove one you have read first." };
  return { ok: true, letters: [...letters, { id, writtenOn: today, openOn, text: body }] };
}

export const removeLetter = (letters: readonly Letter[], id: string) => letters.filter(letter => letter.id !== id);

/** Opened letters (newest first) and sealed ones (soonest first). Sealed text is never returned. */
export function splitLetters(letters: readonly Letter[], today: string) {
  const opened = letters.filter(letter => letter.openOn <= today).sort((a, b) => b.openOn.localeCompare(a.openOn));
  const sealed = letters.filter(letter => letter.openOn > today).sort((a, b) => a.openOn.localeCompare(b.openOn)).map(({ id, writtenOn, openOn }) => ({ id, writtenOn, openOn }));
  return { opened, sealed };
}
