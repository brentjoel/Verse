export const SHOWN_PER_DAY = 4;

/** Whole days since 1970-01-01 for a YYYY-MM-DD date. */
export function dayNumber(date: string): number {
  return Math.floor(Date.parse(`${date}T00:00:00.000Z`) / 86400000);
}

/**
 * A rolling window over a feeling's curated references: four for today, shifting by one each day,
 * so a returning visitor meets a new passage daily. `more` returns the rest, in curated order.
 */
export function todaysReferences(references: readonly string[], day: number, more = false): string[] {
  if (references.length <= SHOWN_PER_DAY) return more ? [] : [...references];
  const start = ((day % references.length) + references.length) % references.length;
  const window = Array.from({ length: SHOWN_PER_DAY }, (_, index) => references[(start + index) % references.length]);
  return more ? references.filter(reference => !window.includes(reference)) : window;
}

/** Server day (UTC). `VERSELIGHT_TODAY` pins it for screenshot and e2e runs only. */
export function serverToday(now = new Date()): string {
  const pinned = process.env.VERSELIGHT_TODAY;
  return pinned && /^\d{4}-\d{2}-\d{2}$/.test(pinned) ? pinned : now.toISOString().slice(0, 10);
}
