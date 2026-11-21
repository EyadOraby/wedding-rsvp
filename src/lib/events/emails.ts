import { APP_NAME } from "@/config/app";
import type { Email } from "@/lib/email";
import type { ReplyInput } from "./answers";
import type { EventContent } from "./content";
import { formatEventDate, formatTime } from "./format";
import { answerText } from "./stats";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Plain, readable HTML that works in every mail app. */
function layout(
  lines: string[],
  button?: { label: string; url: string },
): string {
  const body = lines
    .map((line) => `<p style="margin:0 0 12px">${line}</p>`)
    .join("");
  const cta = button
    ? `<p style="margin:24px 0"><a href="${escapeHtml(button.url)}" style="background:#1c1917;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${escapeHtml(button.label)}</a></p>`
    : "";
  return `<div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#1c1917;max-width:520px">${body}${cta}<p style="color:#78716c;font-size:12px;margin-top:32px">Sent by ${APP_NAME}</p></div>`;
}

function whenWhere(content: EventContent): string {
  const { date, time, venue } = content.details;
  return [formatEventDate(date), formatTime(time), venue]
    .filter(Boolean)
    .join(" · ");
}

function summary(reply: ReplyInput, content: EventContent): string[] {
  const lines = [
    reply.attending
      ? `Coming${reply.guestCount > 1 ? ` (party of ${reply.guestCount})` : ""}`
      : "Not coming",
  ];
  for (const question of content.rsvp.questions) {
    const text = answerText(question, reply.answers);
    if (text) lines.push(`${question.label}: ${text}`);
  }
  if (reply.message) lines.push(`Message: ${reply.message}`);
  return lines;
}

/** Confirmation for the guest, with their private edit link. */
export function guestConfirmation(input: {
  title: string;
  content: EventContent;
  reply: ReplyInput & { email: string };
  editUrl: string;
}): Email {
  const { title, content, reply, editUrl } = input;
  const details = summary(reply, content);
  const when = whenWhere(content);
  const thanks =
    content.rsvp.thankYouMessage || "Your reply has been received.";
  return {
    to: reply.email,
    subject: `Your reply to ${title}`,
    text: [
      `Hi ${reply.name},`,
      thanks,
      when,
      "Your reply:",
      ...details.map((d) => `- ${d}`),
      `Need to change something? ${editUrl}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    html: layout(
      [
        `Hi ${escapeHtml(reply.name)},`,
        escapeHtml(thanks),
        when
          ? `<strong>${escapeHtml(title)}</strong><br>${escapeHtml(when)}`
          : "",
        `<strong>Your reply</strong><br>${details.map(escapeHtml).join("<br>")}`,
      ].filter(Boolean),
      { label: "Change my reply", url: editUrl },
    ),
  };
}

/** Alert for the host when a new reply arrives. */
export function hostAlert(input: {
  title: string;
  content: EventContent;
  reply: ReplyInput;
  hostEmail: string;
  dashboardUrl: string;
}): Email {
  const { title, content, reply, hostEmail, dashboardUrl } = input;
  const status = reply.attending
    ? `is coming${reply.guestCount > 1 ? ` (party of ${reply.guestCount})` : ""}`
    : "can't come";
  const details = summary(reply, content);
  return {
    to: hostEmail,
    subject: `${reply.name} ${status} · ${title}`,
    text: [
      `New reply for ${title}`,
      ...details.map((d) => `- ${d}`),
      `See all replies: ${dashboardUrl}`,
    ].join("\n\n"),
    html: layout(
      [
        `New reply for <strong>${escapeHtml(title)}</strong>`,
        `<strong>${escapeHtml(reply.name)}</strong>${reply.email ? ` (${escapeHtml(reply.email)})` : ""}<br>${details.map(escapeHtml).join("<br>")}`,
      ],
      { label: "See all replies", url: dashboardUrl },
    ),
  };
}
