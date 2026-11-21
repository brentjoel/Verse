import { validLocalDate } from "./streaks";

export const MAX_PRAYERS = 200;
export const MAX_PRAYER_LENGTH = 500;

/** A prayer in the visitor's own words, with the local day it was added and, once answered, that day too. */
export interface Prayer { id: string; text: string; addedOn: string; answeredOn?: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validPrayer(value: unknown): value is Prayer {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const keys = Object.keys(value).sort().join();
  if (keys !== "addedOn,id,text" && keys !== "addedOn,answeredOn,id,text") return false;
  const { id, text, addedOn, answeredOn } = value as Record<string, unknown>;
  return typeof id === "string" && UUID.test(id) && typeof text === "string" && text.trim().length > 0 && text === text.trim()
    && text.length <= MAX_PRAYER_LENGTH && validLocalDate(addedOn)
    && (answeredOn === undefined || (validLocalDate(answeredOn) && answeredOn >= addedOn));
}

/** Untrusted input: bad records are dropped, duplicate ids ignored, the list capped. */
export function parsePrayers(raw: unknown): Prayer[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const prayers: Prayer[] = [];
  for (const item of raw) {
    if (!validPrayer(item) || seen.has(item.id)) continue;
    seen.add(item.id);
    prayers.push({ id: item.id, text: item.text, addedOn: item.addedOn, ...(item.answeredOn ? { answeredOn: item.answeredOn } : {}) });
    if (prayers.length === MAX_PRAYERS) break;
  }
  return prayers;
}

export function addPrayer(prayers: readonly Prayer[], text: string, today: string, id: string): { ok: true; prayers: Prayer[] } | { ok: false; error: string } {
  const body = text.trim();
  if (!body) return { ok: false, error: "Write a few words first." };
  if (body.length > MAX_PRAYER_LENGTH) return { ok: false, error: `Keep it under ${MAX_PRAYER_LENGTH} characters.` };
  if (prayers.length >= MAX_PRAYERS) return { ok: false, error: "Your list is full. Remove an answered prayer first." };
  return { ok: true, prayers: [...prayers, { id, text: body, addedOn: today }] };
}

/** Marks a prayer answered today, or undoes it with `answered = false`. Never earlier than the day it was added. */
export function setAnswered(prayers: readonly Prayer[], id: string, answered: boolean, today: string): Prayer[] {
  return prayers.map(prayer => {
    if (prayer.id !== id) return prayer;
    const { answeredOn: _previous, ...open } = prayer; // eslint-disable-line @typescript-eslint/no-unused-vars
    return answered ? { ...open, answeredOn: today < prayer.addedOn ? prayer.addedOn : today } : open;
  });
}

export const removePrayer = (prayers: readonly Prayer[], id: string) => prayers.filter(prayer => prayer.id !== id);

/** Still praying (oldest first) and answered (most recent first). */
export function splitPrayers(prayers: readonly Prayer[]) {
  const open = prayers.filter(prayer => !prayer.answeredOn).sort((a, b) => a.addedOn.localeCompare(b.addedOn));
  const answered = prayers.filter(prayer => prayer.answeredOn).sort((a, b) => b.answeredOn!.localeCompare(a.answeredOn!));
  return { open, answered };
}
