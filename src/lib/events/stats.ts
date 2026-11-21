import { otherKey, type Answers } from "./answers";
import type { EventContent, Question } from "./content";

export type ReplyLike = {
  name: string;
  email: string | null;
  attending: boolean;
  guestCount: number;
  message: string | null;
  answers: unknown;
  createdAt: Date;
};

export type QuestionStats =
  | {
      id: string;
      label: string;
      type: "single" | "multi";
      answered: number;
      options: { id: string; label: string; count: number }[];
      other: string[];
    }
  | {
      id: string;
      label: string;
      type: "yesno";
      answered: number;
      yes: number;
      no: number;
    }
  | {
      id: string;
      label: string;
      type: "text" | "longtext";
      answered: number;
      texts: string[];
    };

export type EventStats = {
  replies: number;
  attending: number;
  declined: number;
  headcount: number;
  questions: QuestionStats[];
};

export function answersOf(reply: Pick<ReplyLike, "answers">): Answers {
  const value = reply.answers;
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Answers)
    : {};
}

const REMOVED_OPTION = "(removed option)";

/** A reply's answer to one question as plain text, for tables and CSV. */
export function answerText(question: Question, answers: Answers): string {
  const value = answers[question.id];
  switch (question.type) {
    case "single":
      if (typeof value !== "string") return "";
      return (
        question.options.find((o) => o.id === value)?.label ?? REMOVED_OPTION
      );
    case "multi": {
      const labels = Array.isArray(value)
        ? value.map(
            (id) =>
              question.options.find((o) => o.id === id)?.label ??
              REMOVED_OPTION,
          )
        : [];
      const other = answers[otherKey(question.id)];
      if (typeof other === "string" && other) labels.push(`Other: ${other}`);
      return labels.join("; ");
    }
    case "yesno":
      return value === true ? "Yes" : value === false ? "No" : "";
    case "text":
    case "longtext":
      return typeof value === "string" ? value : "";
  }
}

function questionStats(
  question: Question,
  replies: ReplyLike[],
): QuestionStats {
  const all = replies.map(answersOf);
  const has = (a: Answers) => a[question.id] !== undefined;
  const answered = all.filter(has).length;
  switch (question.type) {
    case "single":
    case "multi": {
      const counts = new Map(question.options.map((o) => [o.id, 0]));
      const other: string[] = [];
      for (const a of all) {
        const value = a[question.id];
        const ids = Array.isArray(value)
          ? value
          : typeof value === "string"
            ? [value]
            : [];
        for (const id of ids)
          if (counts.has(id)) counts.set(id, counts.get(id)! + 1);
        const text = a[otherKey(question.id)];
        if (typeof text === "string" && text) other.push(text);
      }
      return {
        id: question.id,
        label: question.label,
        type: question.type,
        answered:
          question.type === "multi"
            ? all.filter((a) => has(a) || a[otherKey(question.id)]).length
            : answered,
        options: question.options.map((o) => ({
          ...o,
          count: counts.get(o.id) ?? 0,
        })),
        other,
      };
    }
    case "yesno":
      return {
        id: question.id,
        label: question.label,
        type: "yesno",
        answered,
        yes: all.filter((a) => a[question.id] === true).length,
        no: all.filter((a) => a[question.id] === false).length,
      };
    case "text":
    case "longtext":
      return {
        id: question.id,
        label: question.label,
        type: question.type,
        answered,
        texts: all
          .map((a) => a[question.id])
          .filter((v): v is string => typeof v === "string" && v.length > 0),
      };
  }
}

/** Headcount and per-question breakdowns for the event dashboard. */
export function computeStats(
  content: EventContent,
  replies: ReplyLike[],
): EventStats {
  const attending = replies.filter((r) => r.attending);
  return {
    replies: replies.length,
    attending: attending.length,
    declined: replies.length - attending.length,
    headcount: attending.reduce((sum, r) => sum + r.guestCount, 0),
    questions: content.rsvp.questions.map((q) => questionStats(q, replies)),
  };
}
