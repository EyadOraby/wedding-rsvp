import { describe, expect, it } from "vitest";
import { ADDABLE_SECTION_TYPES, newQuestion, newSection } from "../catalog";
import {
  EVENT_TYPES,
  eventContentSchema,
  slugSchema,
  type EventContent,
  type QuestionType,
} from "../content";
import { buildFromTemplate, TEMPLATES } from "../templates";

const wedding = () => buildFromTemplate("wedding").content;

function issues(content: unknown): string[] {
  const result = eventContentSchema.safeParse(content);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe("templates", () => {
  it.each(EVENT_TYPES)("%s template is valid content", (type) => {
    expect(issues(TEMPLATES[type].content)).toEqual([]);
  });

  it("returns a copy that does not change the template", () => {
    const copy = wedding();
    copy.details.headline = "Changed";
    expect(TEMPLATES.wedding.content.details.headline).toBe("The wedding of");
  });
});

describe("catalog", () => {
  it("creates valid new sections", () => {
    const content = wedding();
    content.sections.push(...ADDABLE_SECTION_TYPES.map(newSection));
    expect(issues(content)).toEqual([]);
  });

  it("creates valid new questions", () => {
    const content = wedding();
    const types: QuestionType[] = [
      "single",
      "multi",
      "yesno",
      "text",
      "longtext",
    ];
    content.rsvp.questions = types.map(newQuestion);
    expect(issues(content)).toEqual([]);
  });
});

describe("eventContentSchema", () => {
  it("requires exactly one RSVP section", () => {
    const content = wedding();
    content.sections = content.sections.filter((s) => s.type !== "rsvp");
    expect(issues(content)).toContain(
      "The page needs exactly one RSVP section",
    );
  });

  it("does not allow hiding the RSVP section", () => {
    const content = wedding() as unknown as {
      sections: { type: string; enabled: boolean }[];
    };
    content.sections.find((s) => s.type === "rsvp")!.enabled = false;
    expect(issues(content).length).toBeGreaterThan(0);
  });

  it("rejects duplicate question ids", () => {
    const content: EventContent = wedding();
    content.rsvp.questions.push({ ...content.rsvp.questions[0] });
    expect(issues(content)).toContain("Question ids must be unique");
  });

  it("rejects choice questions without options", () => {
    const content = wedding();
    const meal = content.rsvp.questions[0];
    if (meal.type !== "single") throw new Error("expected single");
    meal.options = [];
    expect(issues(content)).toContain("Add at least one option");
  });

  it("only accepts https image links and real dates", () => {
    const content = wedding();
    content.details.heroImageUrl = "http://example.com/a.jpg";
    content.details.date = "2027-02-30";
    const messages = issues(content);
    expect(messages).toContain("Use a link that starts with https://");
    expect(messages).toContain("That date does not exist");
  });

  it("rejects an invalid accent colour", () => {
    const content = wedding();
    content.theme.accent = "red";
    expect(issues(content)).toContain("Use a colour like #b87d8a");
  });
});

describe("slugSchema", () => {
  it("lowercases and accepts dashes", () => {
    expect(slugSchema.parse(" Alex-and-Sam-2027 ")).toBe("alex-and-sam-2027");
  });

  it.each(["ab", "has space", "double--dash", "-start", "émoji"])(
    "rejects %s",
    (slug) => {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    },
  );
});

describe("dates", () => {
  it.each(["2027-13-01", "2027-02-29", "2027-04-31"])(
    "rejects %s without throwing",
    (date) => {
      const content = wedding();
      content.details.date = date;
      expect(issues(content)).toContain("That date does not exist");
    },
  );

  it("accepts a leap day", () => {
    const content = wedding();
    content.details.date = "2028-02-29";
    expect(issues(content)).toEqual([]);
  });
});
