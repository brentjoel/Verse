import type { PersonalData } from "./storage-schema";
import { shiftDate, validLocalDate } from "./streaks";

/** A gentle look back over one calendar year, built only from what is stored on this device. */
export interface YearRecap {
  year: string;
  daysVisited: number;
  reflections: number;
  /** Days visited in each month, January first. */
  months: number[];
  /** Broad feelings by how often they were chosen, most first. */
  emotions: { emotionId: string; count: number }[];
  /** The three most chosen specific feelings. */
  feelings: { emotionId: string; specificId: string; count: number }[];
  longestRun: number;
  saved: number;
  prayersAnswered: number;
  lettersWritten: number;
}

type RecapInput = Pick<PersonalData, "activityDays" | "moodEntries" | "savedVerses" | "letters"> & Pick<Partial<PersonalData>, "prayers">;

/** Years with any activity, newest first. */
export function recapYears(data: Pick<PersonalData, "activityDays">): string[] {
  return [...new Set(data.activityDays.map(day => day.localDate.slice(0, 4)))].sort().reverse();
}

const byCount = <T extends { count: number }>(items: T[]) => items.sort((a, b) => b.count - a.count);

export function buildYearRecap(data: RecapInput, year: string): YearRecap {
  const inYear = (date: string) => validLocalDate(date) && date.startsWith(`${year}-`);
  const days = [...new Set(data.activityDays.map(day => day.localDate).filter(inYear))].sort();
  const moods = data.moodEntries.filter(mood => inYear(mood.localDate));
  const months = Array.from({ length: 12 }, () => 0);
  for (const day of days) months[Number(day.slice(5, 7)) - 1]++;
  let longestRun = 0;
  let run = 0;
  days.forEach((day, index) => {
    run = index > 0 && shiftDate(days[index - 1], 1) === day ? run + 1 : 1;
    longestRun = Math.max(longestRun, run);
  });
  const emotionCounts = new Map<string, number>();
  const feelingCounts = new Map<string, { emotionId: string; specificId: string; count: number; latest: string }>();
  for (const mood of moods) {
    emotionCounts.set(mood.emotionId, (emotionCounts.get(mood.emotionId) ?? 0) + 1);
    const key = `${mood.emotionId}/${mood.specificEmotionId}`;
    const entry = feelingCounts.get(key) ?? { emotionId: mood.emotionId, specificId: mood.specificEmotionId, count: 0, latest: "" };
    entry.count++; if (mood.createdAt > entry.latest) entry.latest = mood.createdAt;
    feelingCounts.set(key, entry);
  }
  // Ties go to the feeling chosen most recently, so the order is stable and meaningful.
  const feelings = [...feelingCounts.values()].sort((a, b) => b.count - a.count || b.latest.localeCompare(a.latest)).slice(0, 3)
    .map(({ emotionId, specificId, count }) => ({ emotionId, specificId, count }));
  return {
    year,
    daysVisited: days.length,
    reflections: moods.length,
    months,
    emotions: byCount([...emotionCounts].map(([emotionId, count]) => ({ emotionId, count }))),
    feelings,
    longestRun,
    saved: data.savedVerses.filter(save => save.createdAt.startsWith(`${year}-`)).length,
    prayersAnswered: (data.prayers ?? []).filter(prayer => prayer.answeredOn && inYear(prayer.answeredOn)).length,
    lettersWritten: data.letters.filter(letter => inYear(letter.writtenOn)).length,
  };
}
