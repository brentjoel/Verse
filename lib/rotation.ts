const SHOWN_PER_DAY = 4;

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

/** Marked references first, otherwise in the original order. */
export function favorFirst(references: readonly string[], marked: ReadonlySet<string>): string[] {
  return [...references.filter(reference => marked.has(reference)), ...references.filter(reference => !marked.has(reference))];
}

/**
 * Every third day the daily verse is one the visitor marked "This spoke to me" (cycling through them);
 * other days, and when nothing is marked, it is the usual daily passage.
 */
export function dailyWithMarks(day: number, usual: string | undefined, marked: readonly string[]): string | undefined {
  if (marked.length === 0 || day % 3 !== 0) return usual;
  return marked[(day / 3) % marked.length];
}
