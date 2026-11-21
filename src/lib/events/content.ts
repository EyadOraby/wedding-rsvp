import { z } from "zod";

/**
 * Everything about how an event page looks and what its RSVP form asks is
 * stored as one JSON document on Event.content. This schema validates it on
 * every write and every read.
 */

export const EVENT_TYPES = [
  "wedding",
  "engagement",
  "birthday",
  "party",
  "dinnerParty",
  "babyShower",
  "graduation",
  "anniversary",
  "corporate",
  "meetup",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const THEME_IDS = [
  "classic",
  "blush",
  "garden",
  "terracotta",
  "sunset",
  "ocean",
  "modern",
  "noir",
  "midnight",
  "deco",
] as const;
export type ThemeId = (typeof THEME_IDS)[number];

/** How the top of the page is laid out. */
export const HERO_LAYOUTS = ["centered", "split", "cover"] as const;
export type HeroLayout = (typeof HERO_LAYOUTS)[number];

const text = (max: number) =>
  z.string().trim().max(max, `Must be ${max} characters or fewer`);

const requiredText = (max: number, message: string) =>
  text(max).min(1, message);

export const idSchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid id");

const httpsUrl = z.union([
  z.literal(""),
  z.url({ protocol: /^https$/, error: "Use a link that starts with https://" }),
]);

/** Date.parse rolls 2027-02-30 over to March, so compare the round trip. */
function isRealDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

const isoDate = z.union([
  z.literal(""),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD")
    .refine((value) => isRealDate(value), "That date does not exist"),
]);

const clockTime = z.union([
  z.literal(""),
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use the format HH:MM"),
]);

export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #b87d8a");

export const detailsSchema = z.object({
  /** Small line above the event title, e.g. "The wedding of". */
  headline: text(80),
  date: isoDate,
  time: clockTime,
  venue: text(120),
  address: text(200),
  mapUrl: httpsUrl,
  heroImageUrl: httpsUrl,
  /** Short welcome text under the title. */
  intro: text(500),
});

export const themeSchema = z.object({
  id: z.enum(THEME_IDS),
  /** Overrides the theme's accent colour; empty keeps the theme default. */
  accent: z.union([z.literal(""), hexColorSchema]),
  /** Older events have no layout yet, so it defaults to centred. */
  layout: z.enum(HERO_LAYOUTS).default("centered"),
});

const sectionBase = {
  id: idSchema,
  enabled: z.boolean(),
  title: text(60),
};

const storySection = z.object({
  ...sectionBase,
  type: z.literal("story"),
  body: text(3000),
});

const scheduleSection = z.object({
  ...sectionBase,
  type: z.literal("schedule"),
  items: z
    .array(
      z.object({
        time: text(20),
        label: requiredText(100, "Schedule items need a name"),
        note: text(200),
      }),
    )
    .max(20),
});

const locationSection = z.object({
  ...sectionBase,
  type: z.literal("location"),
  note: text(500),
});

const countdownSection = z.object({
  ...sectionBase,
  type: z.literal("countdown"),
});

const dressCodeSection = z.object({
  ...sectionBase,
  type: z.literal("dressCode"),
  body: text(1000),
});

const giftsSection = z.object({
  ...sectionBase,
  type: z.literal("gifts"),
  body: text(1000),
  items: z
    .array(
      z.object({
        label: requiredText(60, "Gift details need a label"),
        value: text(200),
      }),
    )
    .max(10),
});

const faqSection = z.object({
  ...sectionBase,
  type: z.literal("faq"),
  items: z
    .array(
      z.object({
        question: requiredText(200, "Questions need text"),
        answer: text(1000),
      }),
    )
    .max(20),
});

/** The RSVP form itself. It is always shown but can be moved. */
const rsvpSection = z.object({
  ...sectionBase,
  type: z.literal("rsvp"),
  enabled: z.literal(true),
});

export const sectionSchema = z.discriminatedUnion("type", [
  storySection,
  scheduleSection,
  locationSection,
  countdownSection,
  dressCodeSection,
  giftsSection,
  faqSection,
  rsvpSection,
]);
export type Section = z.infer<typeof sectionSchema>;
export type SectionType = Section["type"];

const optionSchema = z.object({
  id: idSchema,
  label: requiredText(80, "Options need a label"),
});

const questionBase = {
  id: idSchema,
  label: requiredText(150, "Questions need a label"),
  required: z.boolean(),
  /** "attending" questions are only asked of guests who say yes. */
  showWhen: z.enum(["always", "attending"]),
  /** Food answers (meals, dietary needs, allergies) go to the kitchen summary. */
  kitchen: z.boolean().optional(),
};

const options = z.array(optionSchema).min(1, "Add at least one option").max(20);

export const questionSchema = z.discriminatedUnion("type", [
  z.object({ ...questionBase, type: z.literal("single"), options }),
  z.object({
    ...questionBase,
    type: z.literal("multi"),
    options,
    allowOther: z.boolean(),
  }),
  z.object({ ...questionBase, type: z.literal("yesno") }),
  z.object({ ...questionBase, type: z.literal("text") }),
  z.object({ ...questionBase, type: z.literal("longtext") }),
]);
export type Question = z.infer<typeof questionSchema>;
export type QuestionType = Question["type"];

export const rsvpConfigSchema = z.object({
  /** Last day to reply (inclusive); empty means no deadline. */
  deadline: isoDate,
  allowPlusOnes: z.boolean(),
  /** Most people one reply can cover, including the guest. */
  maxGuests: z.number().int().min(1).max(20),
  collectEmail: z.enum(["off", "optional", "required"]),
  questions: z.array(questionSchema).max(15),
  thankYouMessage: text(300),
  /** Email the host about each new reply (when email is set up). */
  notifyHost: z.boolean().default(true),
});
export type RsvpConfig = z.infer<typeof rsvpConfigSchema>;

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

export const eventContentSchema = z
  .object({
    version: z.literal(1),
    details: detailsSchema,
    theme: themeSchema,
    sections: z.array(sectionSchema).max(20),
    rsvp: rsvpConfigSchema,
  })
  .superRefine((content, ctx) => {
    const rsvpCount = content.sections.filter((s) => s.type === "rsvp").length;
    if (rsvpCount !== 1) {
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "The page needs exactly one RSVP section",
      });
    }
    if (hasDuplicates(content.sections.map((s) => s.id))) {
      ctx.addIssue({
        code: "custom",
        path: ["sections"],
        message: "Section ids must be unique",
      });
    }
    if (hasDuplicates(content.rsvp.questions.map((q) => q.id))) {
      ctx.addIssue({
        code: "custom",
        path: ["rsvp", "questions"],
        message: "Question ids must be unique",
      });
    }
    for (const question of content.rsvp.questions) {
      if (
        "options" in question &&
        hasDuplicates(question.options.map((o) => o.id))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["rsvp", "questions"],
          message: `Options in "${question.label}" must be unique`,
        });
      }
    }
  });
export type EventContent = z.infer<typeof eventContentSchema>;

/** Reads content stored in the database. Throws if it is not valid. */
export function readEventContent(value: unknown): EventContent {
  return eventContentSchema.parse(value);
}

export const eventTitleSchema = requiredText(120, "Give your event a name");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Use at least 3 characters")
  .max(60, "Use 60 characters or fewer")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single dashes",
  );

/** Short random id for sections, questions and options created in the UI. */
export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
