import type { Letter } from "./letters";
import type { MoodEntry } from "./storage-schema";

export interface PrintEntry { id: string; date: string; feeling: string; parent: string; note?: string }
export interface PrintMonth { month: string; entries: PrintEntry[] }

/** Reflections for the printable journal, oldest first, grouped by month. Unknown feelings are skipped. */
export function printMonths(moods: readonly MoodEntry[], describe: (emotionId: string, specificId: string) => { feeling: string; parent: string } | undefined): PrintMonth[] {
  const entries: PrintEntry[] = [];
  for (const mood of [...moods].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const found = describe(mood.emotionId, mood.specificEmotionId);
    if (found) entries.push({ id: mood.id, date: mood.localDate, ...found, ...(mood.note ? { note: mood.note } : {}) });
  }
  const months: PrintMonth[] = [];
  for (const entry of entries) {
    const month = entry.date.slice(0, 7);
    const last = months[months.length - 1];
    if (last?.month === month) last.entries.push(entry); else months.push({ month, entries: [entry] });
  }
  return months;
}

/** Only letters whose day has come; sealed ones never reach a printout. */
export const printableLetters = (letters: readonly Letter[], today: string): Letter[] =>
  letters.filter(letter => letter.openOn <= today).sort((a, b) => a.openOn.localeCompare(b.openOn));
