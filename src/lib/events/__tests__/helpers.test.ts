import { describe, expect, it } from "vitest";
import { csvCell, repliesToCsv } from "../csv";
import {
  daysUntil,
  formatEventDate,
  formatTime,
  isPastDeadline,
} from "../format";
import { slugify, suggestSlug } from "../slug";
import { computeStats, type ReplyLike } from "../stats";
import { buildFromTemplate } from "../templates";
import { readableOn, themeVariables } from "../themes";

const content = buildFromTemplate("wedding").content;

const reply = (overrides: Partial<ReplyLike>): ReplyLike => ({
  name: "Guest",
  email: null,
  attending: true,
  guestCount: 1,
  message: null,
  answers: {},
  createdAt: new Date("2027-01-02T10:00:00Z"),
  ...overrides,
});

const replies = [
  reply({
    name: "Sara",
    guestCount: 2,
    answers: { q_meal: "opt_1", q_dietary: ["opt_2"], q_song: "September" },
  }),
  reply({
    name: "Omar",
    answers: { q_meal: "opt_1", q_dietary__other: "No nuts" },
  }),
  reply({ name: "Lina", attending: false, guestCount: 0 }),
];

describe("computeStats", () => {
  it("counts replies, headcount and answers per option", () => {
    const stats = computeStats(content, replies);
    expect(stats).toMatchObject({
      replies: 3,
      attending: 2,
      declined: 1,
      headcount: 3,
    });
    const meal = stats.questions.find((q) => q.id === "q_meal");
    expect(meal).toMatchObject({
      answered: 2,
      options: [{ label: "Beef", count: 2 }, { count: 0 }, { count: 0 }],
    });
    const dietary = stats.questions.find((q) => q.id === "q_dietary");
    expect(dietary).toMatchObject({
      answered: 2,
      other: [{ name: "Omar", text: "No nuts" }],
    });
    const song = stats.questions.find((q) => q.id === "q_song");
    expect(song).toMatchObject({
      answered: 1,
      texts: [{ name: "Sara", text: "September" }],
    });
  });
});

describe("csv", () => {
  it("quotes special characters and blocks formulas", () => {
    expect(csvCell('Say "hi", ok')).toBe('"Say ""hi"", ok"');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("plain")).toBe("plain");
  });

  it("writes one column per question with readable answers", () => {
    const lines = repliesToCsv(content, replies)
      .replace("\ufeff", "")
      .trim()
      .split("\r\n");
    expect(lines[0]).toBe(
      "Name,Email,Attending,Guests,Meal choice,Dietary requirements,Allergies or food notes for the kitchen,A song that will get you dancing,Message,Replied at",
    );
    expect(lines[1]).toBe(
      "Sara,,Yes,2,Beef,Vegan,,September,,2027-01-02T10:00:00.000Z",
    );
    expect(lines[2]).toContain("Other: No nuts");
    expect(lines[3]).toContain("Lina,,No,0");
  });
});

describe("format", () => {
  it("formats dates and times without shifting time zones", () => {
    expect(formatEventDate("2027-06-12")).toBe("Saturday, June 12, 2027");
    expect(formatTime("16:00")).toBe("4:00 PM");
    expect(formatEventDate("")).toBe("");
  });

  it("counts days and closes replies after the deadline day", () => {
    const now = new Date(2027, 5, 10, 23, 0);
    expect(daysUntil("2027-06-12", now)).toBe(2);
    expect(isPastDeadline("2027-06-10", now)).toBe(false);
    expect(isPastDeadline("2027-06-09", now)).toBe(true);
    expect(isPastDeadline("", now)).toBe(false);
  });
});

describe("slug", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Café & Co!  Party")).toBe("cafe-co-party");
    expect(slugify("!!!")).toBe("");
    expect(slugify("New Year's Eve")).toBe("new-years-eve");
    expect(slugify("Maya\u2019s 30th")).toBe("mayas-30th");
  });

  it("adds a random suffix", () => {
    expect(suggestSlug("Alex & Sam", () => 0.123456)).toMatch(
      /^alex-sam-[a-z0-9]{4}$/,
    );
    expect(suggestSlug("", () => 0.5)).toMatch(/^event-[a-z0-9]{4}$/);
  });
});

describe("themes", () => {
  it("picks readable text for the accent colour", () => {
    expect(readableOn("#ffffff")).toBe("#111111");
    expect(readableOn("#0f1a2e")).toBe("#ffffff");
    // Mid-tone accents read better with dark text (5.8:1) than white (3.3:1).
    expect(readableOn("#b87d8a")).toBe("#111111");
    expect(readableOn("#c9a24b")).toBe("#111111");
  });

  it("uses the custom accent when set", () => {
    expect(
      themeVariables({ id: "classic", accent: "#123456" })["--ev-accent"],
    ).toBe("#123456");
    expect(themeVariables({ id: "classic", accent: "" })["--ev-accent"]).toBe(
      "#b87d8a",
    );
  });
});
