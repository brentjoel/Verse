import type { ActivityDay, MoodEntry } from "./storage-schema";
import { shiftDate } from "./streaks";

export interface SkyStar { date: string; x: number; y: number; reflections: number; emotionId?: string }
export interface SkyLink { from: string; to: string; grace: boolean }
export interface NightSky { stars: SkyStar[]; links: SkyLink[]; graceDates: string[] }

// Stable 0..1 value per date so a star never moves between visits.
function settle(date: string): number {
  let hash = 2166136261;
  for (const char of date) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1000) / 1000;
}

/**
 * One month of the journal as a sky: each active day is a star placed left to right by date,
 * consecutive days are joined, and a grace day bridges its two neighbours with a dimmer line.
 * Positions are percentages (x 4..96, y 18..82). Pure and deterministic.
 */
export function buildNightSky(first: string, last: string, days: readonly ActivityDay[], moods: readonly MoodEntry[], graceDates: readonly string[]): NightSky {
  const span = Math.max(1, Number(last.slice(8)) - 1);
  const active = [...new Set(days.map(day => day.localDate))].filter(date => date >= first && date <= last).sort();
  const stars = active.map(date => {
    const today = moods.filter(mood => mood.localDate === date).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const x = 4 + (Number(date.slice(8)) - 1) / span * 92;
    const y = 18 + settle(date) * 64;
    return { date, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, reflections: today.length, ...(today[0] ? { emotionId: today[0].emotionId } : {}) };
  });
  const links: SkyLink[] = [];
  const grace = graceDates.filter(date => date >= first && date <= last);
  for (let index = 1; index < active.length; index++) {
    const from = active[index - 1], to = active[index];
    if (to === shiftDate(from, 1)) links.push({ from, to, grace: false });
    else if (to === shiftDate(from, 2) && graceDates.includes(shiftDate(from, 1))) links.push({ from, to, grace: true });
  }
  return { stars, links, graceDates: grace };
}
