// Calendar labels are stored as YYYY-MM-DD local dates; format them in UTC so no timezone shifts the day.
export function formatDay(date: string, locale?: string, withYear = false): string {
  const value = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
  if (!Number.isFinite(value.getTime())) return date;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" }).format(value);
}

export function formatMonth(month: string, locale?: string): string {
  const value = new Date(`${month.slice(0, 7)}-01T00:00:00.000Z`);
  if (!Number.isFinite(value.getTime())) return month;
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(value);
}
