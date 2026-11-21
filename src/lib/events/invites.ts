import { z } from "zod";
import { prisma } from "@/lib/db";
import { isToken } from "./tokens";

export const inviteInputSchema = z.object({
  name: z.string().trim().min(1, "Each guest needs a name").max(100),
  email: z
    .union([z.literal(""), z.email("Check the email addresses")])
    .nullish()
    .transform((value) => value || null),
  maxGuests: z.number().int().min(1).max(20).nullish(),
});

export const addInvitesSchema = z.object({
  invites: z
    .array(inviteInputSchema)
    .min(1, "Add at least one guest")
    .max(200, "Add up to 200 guests at a time"),
});

const LINE_BREAK = /\r?\n/;
const SEPARATOR = /[,;\t]/;
const DIGITS = /^\d+$/;

/**
 * Reads pasted lines like "Sara Ahmed, sara@example.com, 2": a name, then an
 * optional email and party size in any order. Blank lines are skipped.
 */
export function parseGuestLines(text: string) {
  return text
    .split(LINE_BREAK)
    .map((line) =>
      line
        .split(SEPARATOR)
        .map((part) => part.trim())
        .filter(Boolean),
    )
    .filter((parts) => parts.length > 0)
    .map(([name, ...rest]) => ({
      name,
      email: rest.find((part) => part.includes("@")) ?? null,
      maxGuests: Number(rest.find((part) => DIGITS.test(part))) || null,
    }));
}

/** The invitation named by a reply's inviteToken, if it belongs to the event. */
export async function findInvite(eventId: string, body: unknown) {
  const token =
    typeof body === "object" && body !== null && "inviteToken" in body
      ? body.inviteToken
      : null;
  if (typeof token !== "string" || !isToken(token)) return null;
  return prisma.invite.findFirst({
    where: { eventId, token },
    select: { id: true, maxGuests: true },
  });
}
