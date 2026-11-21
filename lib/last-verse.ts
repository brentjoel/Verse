// Remembers which passage of a feeling you were reading, for this browser session only.
const PREFIX = "verselight-last-verse:";

export function lastVerseKey(path: string): string {
  return PREFIX + path;
}

/** Returns a valid passage index from stored text, or 0 when it is missing or out of range. */
export function parseLastVerse(raw: string | null | undefined, count: number): number {
  if (typeof raw !== "string" || !/^\d{1,3}$/.test(raw)) return 0;
  const index = Number(raw);
  return index < count ? index : 0;
}

export function readLastVerse(path: string, count: number): number {
  try { return parseLastVerse(sessionStorage.getItem(lastVerseKey(path)), count); } catch { return 0; }
}

export function writeLastVerse(path: string, index: number): void {
  try { sessionStorage.setItem(lastVerseKey(path), String(index)); } catch { /* Remembering is optional. */ }
}
