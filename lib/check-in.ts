import { validLocalDate } from "./streaks";
import type { MoodEntry } from "./storage-schema";

export const CHECK_IN_DISMISS_KEY = "verselight-check-in-dismissed";

/** The latest reflection, but only when it is from an earlier local day and the card was not dismissed today. */
export function pickCheckIn(moods: readonly MoodEntry[], today: string, dismissedOn?: string): MoodEntry | undefined {
  if (!validLocalDate(today) || dismissedOn === today) return undefined;
  let latest: MoodEntry | undefined;
  for (const mood of moods) if (!latest || mood.createdAt > latest.createdAt) latest = mood;
  return latest && latest.localDate < today ? latest : undefined;
}

/** Browser storage is untrusted: only a plain local date is accepted. */
export function parseDismissed(raw: unknown): string | undefined {
  return validLocalDate(raw) ? raw : undefined;
}
