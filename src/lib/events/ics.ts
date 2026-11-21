import { APP_NAME } from "@/config/app";
import type { EventContent } from "./content";

const DEFAULT_LENGTH_HOURS = 3;

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Lines longer than 75 characters are folded as the iCalendar spec asks. */
function fold(line: string): string {
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 73) parts.push(line.slice(i, i + 73));
  return parts.join("\r\n ");
}

function stamp(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/** "2027-06-12" + "16:00" as a floating local time: 20270612T160000. */
function localDateTime(date: string, time: string, addHours = 0): string {
  const d = new Date(`${date}T${time}:00Z`);
  d.setUTCHours(d.getUTCHours() + addHours);
  return stamp(d).replace("Z", "");
}

/**
 * An .ics file for the event, or null when it has no date yet. Times have
 * no time zone, so calendars show them as written on the invitation.
 */
export function buildIcs(input: {
  title: string;
  slug: string;
  url: string;
  content: EventContent;
  now?: Date;
}): string | null {
  const { date, time, venue, address, intro } = input.content.details;
  if (!date) return null;

  const timing = time
    ? [
        `DTSTART:${localDateTime(date, time)}`,
        `DTEND:${localDateTime(date, time, DEFAULT_LENGTH_HOURS)}`,
      ]
    : [
        `DTSTART;VALUE=DATE:${date.replace(/-/g, "")}`,
        `DTEND;VALUE=DATE:${localDateTime(date, "00:00", 24).slice(0, 8)}`,
      ];

  const location = [venue, address].filter(Boolean).join(", ");
  const description = [intro, `RSVP: ${input.url}`]
    .filter(Boolean)
    .join("\n\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${APP_NAME}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${input.slug}@rsvp`,
    `DTSTAMP:${stamp(input.now ?? new Date())}`,
    ...timing,
    `SUMMARY:${escapeText(input.title)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${input.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}
