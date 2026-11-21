export const SPOKE_KEY = "verselight-spoke";
export const MAX_MARKS = 100;

/** Browser storage is untrusted: only a list of distinct curated references is accepted. */
export function parseMarks(raw: unknown, known: ReadonlySet<string>): string[] {
  if (!Array.isArray(raw)) return [];
  const marks: string[] = [];
  for (const item of raw) if (typeof item === "string" && known.has(item) && !marks.includes(item)) { marks.push(item); if (marks.length === MAX_MARKS) break; }
  return marks;
}

export const toggleMark = (marks: readonly string[], reference: string): string[] =>
  marks.includes(reference) ? marks.filter(mark => mark !== reference) : marks.length >= MAX_MARKS ? [...marks] : [...marks, reference];
