/**
 * Event dates and times are stored as plain "YYYY-MM-DD" and "HH:MM" in the
 * event's own time zone, so they are formatted as UTC to avoid shifting.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function formatEventDate(date: string, locale = "en-US"): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtcDate(date));
}

export function formatShortDate(date: string, locale = "en-US"): string {
  if (!date) return "";
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(toUtcDate(date));
}

export function formatTime(time: string, locale = "en-US"): string {
  if (!time) return "";
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`1970-01-01T${time}:00Z`));
}

/** Whole days from today until the date; negative once it has passed. */
export function daysUntil(date: string, now: Date = new Date()): number | null {
  if (!date) return null;
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((toUtcDate(date).getTime() - today) / DAY_MS);
}

/** The deadline day itself still counts, so replies close the day after. */
export function isPastDeadline(
  deadline: string,
  now: Date = new Date(),
): boolean {
  const days = daysUntil(deadline, now);
  return days !== null && days < 0;
}
