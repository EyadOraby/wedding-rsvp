import { describe, expect, it } from "vitest";
import { QUESTION_PRESETS } from "../catalog";
import { EVENT_TYPES, eventContentSchema } from "../content";
import { kitchenRows, kitchenToCsv } from "../csv";
import type { ReplyLike } from "../stats";
import { buildFromTemplate } from "../templates";

const reply = (overrides: Partial<ReplyLike>): ReplyLike => ({
  name: "Guest",
  email: null,
  attending: true,
  guestCount: 1,
  message: null,
  answers: {},
  createdAt: new Date("2027-01-01T00:00:00Z"),
  ...overrides,
});

describe("dietary needs and allergies", () => {
  it.each(EVENT_TYPES)("the %s template asks about both", (type) => {
    const questions = buildFromTemplate(type).content.rsvp.questions;
    const dietary = questions.find((q) => q.id === "q_dietary");
    const allergies = questions.find((q) => q.id === "q_allergies");
    expect(dietary).toMatchObject({
      type: "multi",
      allowOther: true,
      kitchen: true,
    });
    expect(allergies).toMatchObject({ type: "text", kitchen: true });
  });

  it("offers dairy free and shellfish allergy", () => {
    const dietary = buildFromTemplate("wedding").content.rsvp.questions.find(
      (q) => q.id === "q_dietary",
    );
    const labels =
      dietary && "options" in dietary
        ? dietary.options.map((o) => o.label)
        : [];
    expect(labels).toEqual(
      expect.arrayContaining(["Dairy free", "Shellfish allergy"]),
    );
  });

  it("quick-add presets stay valid even when added twice", () => {
    const content = buildFromTemplate("party").content;
    for (const preset of QUESTION_PRESETS) {
      content.rsvp.questions.push(...preset.build(), ...preset.build());
    }
    content.rsvp.questions = content.rsvp.questions.slice(-12);
    expect(eventContentSchema.safeParse(content).success).toBe(true);
  });
});

describe("kitchen summary", () => {
  const content = buildFromTemplate("wedding").content;
  const replies = [
    reply({
      name: "Sara",
      guestCount: 2,
      answers: { q_meal: "opt_2", q_allergies: "Peanuts" },
    }),
    reply({ name: "Omar", answers: { q_dietary: ["opt_7"] } }),
    reply({
      name: "Lina",
      attending: false,
      answers: { q_allergies: "Gluten" },
    }),
    reply({ name: "Karim", answers: {} }),
  ];

  it("lists only guests who are coming and gave a food answer", () => {
    const rows = kitchenRows(content, replies);
    expect(rows.map((r) => r.name)).toEqual(["Sara", "Omar"]);
    expect(rows[0]).toEqual({
      name: "Sara",
      guests: 2,
      answers: ["Fish", "", "Peanuts"],
    });
    expect(rows[1].answers[1]).toBe("Dairy free");
  });

  it("exports the kitchen columns only", () => {
    const lines = kitchenToCsv(content, replies)
      .replace("\uFEFF", "")
      .trim()
      .split("\r\n");
    expect(lines[0]).toBe(
      "Name,Guests,Meal choice,Dietary requirements,Allergies or food notes for the kitchen",
    );
    expect(lines).toHaveLength(3);
  });
});

describe("events saved before the kitchen flag", () => {
  it("still send template food questions to the kitchen", () => {
    const content = buildFromTemplate("wedding").content;
    for (const q of content.rsvp.questions) delete q.kitchen;
    const rows = kitchenRows(content, [
      reply({ name: "Sara", answers: { q_meal: "opt_1" } }),
    ]);
    expect(rows).toEqual([
      { name: "Sara", guests: 1, answers: ["Beef", "", ""] },
    ]);
  });
});
