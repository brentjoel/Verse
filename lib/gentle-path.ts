import { shiftDate, validLocalDate } from "./streaks";

export const PATH_KEY = "verselight-path";
const PATH_DAYS = 7;

export interface ActivePath { emotionId: string; specificId: string; startedOn: string }

/** One verse a day for seven days, taken in curated order. */
export const pathReferences = (references: readonly string[]): string[] => references.slice(0, PATH_DAYS);

/** Browser storage is untrusted: exact keys, a real local date and a feeling that exists. */
export function parsePath(raw: unknown, isKnown: (emotionId: string, specificId: string) => boolean): ActivePath | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  if (Object.keys(raw).sort().join() !== "emotionId,specificId,startedOn") return undefined;
  const { emotionId, specificId, startedOn } = raw as Record<string, unknown>;
  if (typeof emotionId !== "string" || typeof specificId !== "string" || !validLocalDate(startedOn) || !isKnown(emotionId, specificId)) return undefined;
  return { emotionId, specificId, startedOn };
}

/** Day 1 on the start date, then one more each local day. Past the last day it keeps counting. */
export function dayOfPath(startedOn: string, today: string): number {
  if (!validLocalDate(startedOn) || !validLocalDate(today) || today <= startedOn) return 1;
  return Math.round((Date.parse(`${today}T00:00:00.000Z`) - Date.parse(`${startedOn}T00:00:00.000Z`)) / 86400000) + 1;
}

export const dateOfDay = (startedOn: string, day: number) => shiftDate(startedOn, day - 1);
export const pathComplete = (startedOn: string, today: string) => dayOfPath(startedOn, today) > PATH_DAYS;
