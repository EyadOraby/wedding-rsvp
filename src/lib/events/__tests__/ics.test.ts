import { describe, expect, it } from "vitest";
import { buildIcs } from "../ics";
import { buildFromTemplate } from "../templates";

function build(details: Partial<ReturnType<typeof base>["details"]>) {
  const content = base();
  Object.assign(content.details, details);
  return buildIcs({
    title: "Alex & Sam, together",
    slug: "alex-sam",
    url: "https://example.com/e/alex-sam",
    content,
    now: new Date("2027-01-01T08:00:00Z"),
  });
}

function base() {
  return buildFromTemplate("wedding").content;
}

describe("buildIcs", () => {
  it("returns null until the event has a date", () => {
    expect(build({ date: "" })).toBeNull();
  });

  it("writes a timed event that lasts three hours", () => {
    const ics = build({
      date: "2027-06-12",
      time: "22:30",
      venue: "Hall; East",
    })!;
    expect(ics).toContain("DTSTART:20270612T223000\r\n");
    expect(ics).toContain("DTEND:20270613T013000\r\n");
    expect(ics).toContain("SUMMARY:Alex & Sam\\, together\r\n");
    expect(ics).toContain("LOCATION:Hall\\; East\r\n");
    expect(ics).toContain("DTSTAMP:20270101T080000Z\r\n");
  });

  it("writes an all-day event when there is no time", () => {
    const ics = build({ date: "2027-12-31", time: "" })!;
    expect(ics).toContain("DTSTART;VALUE=DATE:20271231\r\n");
    expect(ics).toContain("DTEND;VALUE=DATE:20280101\r\n");
  });

  it("folds long lines", () => {
    const ics = build({ date: "2027-06-12", intro: "x".repeat(200) })!;
    for (const line of ics.split("\r\n")) {
      expect(line.length).toBeLessThanOrEqual(75);
    }
  });
});
