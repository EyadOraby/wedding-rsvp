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
    "﻿" +
    [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}
