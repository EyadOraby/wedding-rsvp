import { after } from "next/server";
import { APP_NAME } from "@/config/app";

/**
 * Email goes through Resend's HTTP API. Nothing is sent unless
 * RESEND_API_KEY is set, so the app works the same without it.
 */
export type Email = { to: string; subject: string; html: string; text: string };

const DEFAULT_FROM = `${APP_NAME} <onboarding@resend.dev>`;

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || DEFAULT_FROM,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  });
  if (!res.ok) {
    console.error("Email failed", res.status, await res.text().catch(() => ""));
  }
  return res.ok;
}

/**
 * Sends after the response has gone out, so a slow or failing email never
 * delays or breaks the request that triggered it.
 */
export function sendLater(emails: Email[]): void {
  if (!emailEnabled() || emails.length === 0) return;
  const task = async () => {
    for (const email of emails) {
      await sendEmail(email).catch((error) =>
        console.error("Email failed", error),
      );
    }
  };
  try {
    after(task);
  } catch {
    // Outside a request (scripts, tests): send without waiting.
    void task();
  }
}
