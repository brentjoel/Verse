import { parseLetters, type Letter } from "./letters";
import { parsePrayers, type Prayer } from "./prayers";

/**
 * Optional journal passcode. Everything happens on this device with Web Crypto:
 * PBKDF2 (SHA-256) turns the passcode into an AES-GCM key, and the private text
 * (reflection notes, letters, prayers) is sealed into `lock.data`. Nothing is sent anywhere.
 * There is no recovery: without the passcode the sealed text cannot be read.
 */
export const LOCK_ITERATIONS = 600_000;
export const MIN_PASSCODE_LENGTH = 6;
export const MAX_SEALED_LENGTH = 7_000_000; // Base64 of the 5 MiB data limit, with room to spare.

export interface JournalLock { version: 1; salt: string; iterations: number; iv: string; data: string }
/** The private text held inside the lock. Notes are keyed by reflection id. */
export interface JournalSecret { notes: Record<string, string>; letters: Letter[]; prayers: Prayer[] }

interface PrivateFields {
  moodEntries: { id: string; note?: string }[];
  letters: Letter[];
  prayers?: Prayer[];
}

const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;
function toBase64(bytes: Uint8Array) { let text = ""; for (const byte of bytes) text += String.fromCharCode(byte); return btoa(text); }
function fromBase64(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes;
}
function decodedLength(text: string) { try { return fromBase64(text).length; } catch { return -1; } }

/** Shape check for stored data; it says nothing about whether the passcode is right. */
export function validLock(value: unknown): value is JournalLock {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (Object.keys(value).sort().join() !== "data,iterations,iv,salt,version") return false;
  const { version, salt, iterations, iv, data } = value as Record<string, unknown>;
  return version === 1 && Number.isSafeInteger(iterations) && Number(iterations) >= 100_000 && Number(iterations) <= 10_000_000
    && typeof salt === "string" && BASE64.test(salt) && decodedLength(salt) === 16
    && typeof iv === "string" && BASE64.test(iv) && decodedLength(iv) === 12
    && typeof data === "string" && data.length > 0 && data.length <= MAX_SEALED_LENGTH && BASE64.test(data);
}

export async function deriveKey(passcode: string, salt: string, iterations: number): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey("raw", new TextEncoder().encode(passcode), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: fromBase64(salt), iterations }, material, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

/** A held key plus the salt and iteration count it was made with, so new seals stay openable by the same passcode. */
export interface LockKey { key: CryptoKey; salt: string; iterations: number }

export async function newLockKey(passcode: string, iterations = LOCK_ITERATIONS): Promise<LockKey> {
  if (passcode.length < MIN_PASSCODE_LENGTH) throw new Error(`Use at least ${MIN_PASSCODE_LENGTH} characters.`);
  const salt = toBase64(crypto.getRandomValues(new Uint8Array(16)));
  return { key: await deriveKey(passcode, salt, iterations), salt, iterations };
}

export async function seal(secret: JournalSecret, lockKey: LockKey): Promise<JournalLock> {
  const iv = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));
  const sealed = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, lockKey.key, new TextEncoder().encode(JSON.stringify(secret)));
  return { version: 1, salt: lockKey.salt, iterations: lockKey.iterations, iv: toBase64(iv), data: toBase64(new Uint8Array(sealed)) };
}

/** Opens with a key already held. Throws when the key does not fit or the content is not a valid secret. */
export async function openWithKey(lock: JournalLock, lockKey: LockKey): Promise<JournalSecret> {
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64(lock.iv) }, lockKey.key, fromBase64(lock.data));
  return parseSecret(JSON.parse(new TextDecoder().decode(plain)) as unknown);
}

/** Wrong passcodes fail the AES-GCM check and throw a friendly error. */
export async function unlock(lock: JournalLock, passcode: string): Promise<{ lockKey: LockKey; secret: JournalSecret }> {
  const lockKey = { key: await deriveKey(passcode, lock.salt, lock.iterations), salt: lock.salt, iterations: lock.iterations };
  try { return { lockKey, secret: await openWithKey(lock, lockKey) }; }
  catch { throw new Error("That passcode did not open your journal. Please try again."); }
}

function parseSecret(raw: unknown): JournalSecret {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("The locked journal could not be read.");
  const { notes, letters, prayers } = raw as Record<string, unknown>;
  const cleanNotes: Record<string, string> = {};
  if (notes && typeof notes === "object" && !Array.isArray(notes)) {
    for (const [id, note] of Object.entries(notes)) if (typeof note === "string" && note.length <= 2000) cleanNotes[id] = note;
  }
  return { notes: cleanNotes, letters: parseLetters(letters), prayers: parsePrayers(prayers) };
}

/** The private text of the data, ready to seal. */
export function secretOf(data: PrivateFields): JournalSecret {
  const notes: Record<string, string> = {};
  for (const mood of data.moodEntries) if (mood.note) notes[mood.id] = mood.note;
  return { notes, letters: data.letters.map(letter => ({ ...letter })), prayers: (data.prayers ?? []).map(prayer => ({ ...prayer })) };
}

/** A copy with the private text removed, which is what a locked journal stores. */
export function withoutSecret<T extends PrivateFields>(data: T): T {
  const copy = structuredClone(data);
  copy.moodEntries = copy.moodEntries.map(mood => { const rest = { ...mood }; delete rest.note; return rest; });
  copy.letters = [];
  delete copy.prayers;
  return copy;
}

/** True when any private text is present in plain form. */
export function hasSecret(data: PrivateFields) {
  return data.moodEntries.some(mood => mood.note) || data.letters.length > 0 || (data.prayers?.length ?? 0) > 0;
}

/** Puts the opened private text back. Notes for reflections removed meanwhile are dropped. */
export function withSecret<T extends PrivateFields>(data: T, secret: JournalSecret): T {
  const copy = structuredClone(data);
  copy.moodEntries = copy.moodEntries.map(mood => secret.notes[mood.id] ? { ...mood, note: secret.notes[mood.id] } : mood);
  copy.letters = secret.letters.map(letter => ({ ...letter }));
  if (secret.prayers.length > 0) copy.prayers = secret.prayers.map(prayer => ({ ...prayer })); else delete copy.prayers;
  return copy;
}
