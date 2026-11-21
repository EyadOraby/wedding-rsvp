import { describe, expect, it } from "vitest";
import { validateReply } from "../answers";
import { buildFromTemplate } from "../templates";

const wedding = () => buildFromTemplate("wedding").content;
const corporate = () => buildFromTemplate("corporate").content;

describe("validateReply", () => {
  it("accepts a full attending reply and keeps only known answers", () => {
    const result = validateReply(wedding(), {
      name: "  Sara  ",
      email: "sara@example.com",
      attending: true,
      guestCount: 2,
      message: "Can't wait",
      answers: {
        q_meal: "opt_2",
        q_dietary: ["opt_1", "opt_1"],
        q_dietary__other: " No mushrooms ",
        q_song: "September",
        q_unknown: "dropped",
      },
    });
    expect(result).toEqual({
      ok: true,
      data: {
        name: "Sara",
        email: "sara@example.com",
        attending: true,
        guestCount: 2,
        message: "Can't wait",
        answers: {
          q_meal: "opt_2",
          q_dietary: ["opt_1"],
          q_dietary__other: "No mushrooms",
          q_song: "September",
        },
      },
    });
  });

  it("requires required questions for attending guests", () => {
    const result = validateReply(wedding(), { name: "Sara", attending: true });
    expect(result).toMatchObject({
      ok: false,
      error: 'Please answer "Meal choice"',
      field: "answers.q_meal",
    });
  });

  it("rejects option ids that are not on the question", () => {
    const result = validateReply(wedding(), {
      name: "Sara",
      attending: true,
      answers: { q_meal: "opt_99" },
    });
    expect(result.ok).toBe(false);
  });

  it("stores declining guests with zero guests and no attending-only answers", () => {
    const result = validateReply(wedding(), {
      name: "Omar",
      attending: false,
      guestCount: 2,
      answers: { q_meal: "opt_1" },
    });
    expect(result).toMatchObject({
      ok: true,
      data: { guestCount: 0, answers: {} },
    });
  });

  it("caps the guest count at the event's limit", () => {
    const result = validateReply(wedding(), {
      name: "Sara",
      attending: true,
      guestCount: 3,
      answers: { q_meal: "opt_1" },
    });
    expect(result).toMatchObject({
      ok: false,
      error: "At most 2 guests per reply",
    });
  });

  it("allows one guest only when plus-ones are off", () => {
    const result = validateReply(corporate(), {
      name: "Lee",
      email: "lee@example.com",
      attending: true,
      guestCount: 2,
      answers: { q_company: "Acme" },
    });
    expect(result).toMatchObject({
      ok: false,
      error: "This invitation is for one guest",
    });
  });

  it("requires a valid email when the event asks for one", () => {
    const missing = validateReply(corporate(), {
      name: "Lee",
      attending: false,
    });
    const invalid = validateReply(corporate(), {
      name: "Lee",
      email: "nope",
      attending: false,
    });
    expect(missing).toMatchObject({ ok: false, field: "email" });
    expect(invalid).toMatchObject({
      ok: false,
      error: "Please enter a valid email address",
    });
  });

  it("turns an empty optional email into null", () => {
    const result = validateReply(wedding(), {
      name: "Sara",
      email: "",
      attending: false,
    });
    expect(result).toMatchObject({ ok: true, data: { email: null } });
  });

  it("returns a message instead of throwing on malformed input", () => {
    expect(validateReply(wedding(), null).ok).toBe(false);
    expect(validateReply(wedding(), { name: 42, attending: "yes" }).ok).toBe(
      false,
    );
    expect(
      validateReply(wedding(), {
        name: "A",
        attending: true,
        answers: { q_meal: "opt_1", q_song: 5 },
      }).ok,
    ).toBe(false);
  });
});
