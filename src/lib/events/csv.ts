import type { EventContent } from "./content";
import { answersOf, answerText, type ReplyLike } from "./stats";

/**
 * Quotes a cell when needed and stops spreadsheet apps from running values
 * that start like a formula (=, +, -, @).
 */
export function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** All replies as CSV, one column per RSVP question. */
export function repliesToCsv(
  content: EventContent,
  replies: ReplyLike[],
): string {
  const questions = content.rsvp.questions;
  const header = [
    "Name",
    "Email",
    "Attending",
    "Guests",
    ...questions.map((q) => q.label),
    "Message",
    "Replied at",
  ];
  const rows = replies.map((reply) => {
    const answers = answersOf(reply);
    return [
      reply.name,
      reply.email ?? "",
      reply.attending ? "Yes" : "No",
      reply.guestCount,
      ...questions.map((q) => answerText(q, answers)),
      reply.message ?? "",
      reply.createdAt.toISOString(),
    ];
  });
  // The byte order mark makes Excel read the file as UTF-8.
  return (
    "\ufeff" +
    [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}

/** Template food questions, for events saved before the kitchen flag existed. */
const TEMPLATE_KITCHEN_IDS = new Set([
  "q_meal",
  "q_main",
  "q_dietary",
  "q_allergies",
]);

/** Questions marked for the kitchen: meals, dietary needs and allergies. */
export function kitchenQuestions(content: EventContent) {
  return content.rsvp.questions.filter(
    (q) => q.kitchen ?? TEMPLATE_KITCHEN_IDS.has(q.id),
  );
}

/** Guests who are coming and gave at least one kitchen answer. */
export function kitchenRows(content: EventContent, replies: ReplyLike[]) {
  const questions = kitchenQuestions(content);
  return replies
    .filter((reply) => reply.attending)
    .map((reply) => {
      const answers = answersOf(reply);
      return {
        name: reply.name,
        guests: reply.guestCount,
        answers: questions.map((q) => answerText(q, answers)),
      };
    })
    .filter((row) => row.answers.some(Boolean));
}

/** The kitchen summary as CSV, for the caterer. */
export function kitchenToCsv(
  content: EventContent,
  replies: ReplyLike[],
): string {
  const header = [
    "Name",
    "Guests",
    ...kitchenQuestions(content).map((q) => q.label),
  ];
  const rows = kitchenRows(content, replies).map((row) => [
    row.name,
    row.guests,
    ...row.answers,
  ]);
  return (
    "\ufeff" +
    [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}
