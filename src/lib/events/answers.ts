import { z } from "zod";
import type { EventContent, Question } from "./content";

/**
 * Answers are stored as { [questionId]: value }. Multiple choice questions
 * that allow "Other" also store the free text under `${questionId}__other`.
 */
export type AnswerValue = string | string[] | boolean;
export type Answers = Record<string, AnswerValue>;

export type ReplyInput = {
  name: string;
  email: string | null;
  attending: boolean;
  guestCount: number;
  message: string | null;
  answers: Answers;
};

export type ReplyValidation =
  { ok: true; data: ReplyInput } | { ok: false; error: string; field?: string };

export const otherKey = (questionId: string) => `${questionId}__other`;

const TEXT_LIMITS = { text: 300, longtext: 2000, other: 200 } as const;

/** Questions a guest sees, given whether they are attending. */
export function visibleQuestions(
  content: EventContent,
  attending: boolean,
): Question[] {
  return content.rsvp.questions.filter(
    (q) => q.showWhen === "always" || attending,
  );
}

function baseSchema(content: EventContent) {
  const { rsvp } = content;
  const email = z.email("Please enter a valid email address");
  return z.object({
    name: z
      .string({ error: "Please enter your name" })
      .trim()
      .min(1, "Please enter your name")
      .max(100, "Name must be 100 characters or fewer"),
    email:
      rsvp.collectEmail === "required"
        ? z.string({ error: "Please enter your email" }).trim().pipe(email)
        : z
            .union([z.literal(""), z.string().trim().pipe(email)])
            .nullish()
            .transform((value) => value || null),
    attending: z.boolean({ error: "Please let us know if you can come" }),
    guestCount: z
      .number({ error: "Please enter how many guests" })
      .int()
      .min(1, "At least 1 guest")
      .max(
        rsvp.allowPlusOnes ? rsvp.maxGuests : 1,
        rsvp.allowPlusOnes
          ? `At most ${rsvp.maxGuests} guests per reply`
          : "This invitation is for one guest",
      )
      .default(1),
    message: z
      .string()
      .trim()
      .max(1000, "Message must be 1000 characters or fewer")
      .nullish()
      .transform((value) => value || null),
    answers: z.record(z.string(), z.unknown()).default({}),
  });
}

type Checked = { value?: AnswerValue; other?: string; error?: string };

function checkAnswer(
  question: Question,
  raw: unknown,
  rawOther: unknown,
): Checked {
  const missing = `Please answer "${question.label}"`;
  switch (question.type) {
    case "single": {
      if (raw === undefined || raw === null || raw === "") {
        return question.required ? { error: missing } : {};
      }
      const valid = question.options.some((o) => o.id === raw);
      return valid
        ? { value: raw as string }
        : { error: `Choose one of the options for "${question.label}"` };
    }
    case "multi": {
      const list = raw === undefined || raw === null ? [] : raw;
      if (!Array.isArray(list) || !list.every((v) => typeof v === "string")) {
        return { error: `Invalid answer for "${question.label}"` };
      }
      const ids = new Set(question.options.map((o) => o.id));
      if (!list.every((v) => ids.has(v))) {
        return { error: `Choose from the options for "${question.label}"` };
      }
      let other = "";
      if (question.allowOther && typeof rawOther === "string") {
        other = rawOther.trim().slice(0, TEXT_LIMITS.other);
      }
      const selected = [...new Set(list as string[])];
      if (question.required && selected.length === 0 && !other) {
        return { error: missing };
      }
      // Leave unanswered questions out so they do not count as answered.
      return {
        value: selected.length > 0 ? selected : undefined,
        other: other || undefined,
      };
    }
    case "yesno": {
      if (raw === undefined || raw === null) {
        return question.required ? { error: missing } : {};
      }
      return typeof raw === "boolean"
        ? { value: raw }
        : { error: `Invalid answer for "${question.label}"` };
    }
    case "text":
    case "longtext": {
      if (raw !== undefined && raw !== null && typeof raw !== "string") {
        return { error: `Invalid answer for "${question.label}"` };
      }
      const value = (raw ?? "").trim();
      const limit = TEXT_LIMITS[question.type];
      if (value.length > limit) {
        return {
          error: `"${question.label}" must be ${limit} characters or fewer`,
        };
      }
      if (!value) return question.required ? { error: missing } : {};
      return { value };
    }
  }
}

/**
 * Validates a guest's reply against the event's own RSVP settings and
 * questions. Unknown answers are dropped; declining guests are stored with
 * zero guests and only the questions asked of everyone.
 */
export function validateReply(
  content: EventContent,
  body: unknown,
): ReplyValidation {
  const parsed = baseSchema(content).safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? "Invalid reply",
      field: issue?.path[0]?.toString(),
    };
  }
  const { answers: rawAnswers, ...reply } = parsed.data;
  const answers: Answers = {};

  for (const question of visibleQuestions(content, reply.attending)) {
    const checked = checkAnswer(
      question,
      rawAnswers[question.id],
      rawAnswers[otherKey(question.id)],
    );
    if (checked.error) {
      return {
        ok: false,
        error: checked.error,
        field: `answers.${question.id}`,
      };
    }
    if (checked.value !== undefined) answers[question.id] = checked.value;
    if (checked.other) answers[otherKey(question.id)] = checked.other;
  }

  return {
    ok: true,
    data: {
      ...reply,
      email: reply.email ?? null,
      guestCount: reply.attending ? reply.guestCount : 0,
      answers,
    },
  };
}
