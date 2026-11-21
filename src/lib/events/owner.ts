import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  EVENT_TYPES,
  eventContentSchema,
  eventTitleSchema,
  readEventContent,
  slugSchema,
} from "./content";

export const createEventSchema = z.object({
  type: z.enum(EVENT_TYPES, { error: "Choose a template" }),
});

export const updateEventSchema = z.object({
  title: eventTitleSchema,
  slug: slugSchema,
  published: z.boolean(),
  content: eventContentSchema,
});
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

/** The event if it belongs to the user, otherwise null. */
export async function getOwnedEvent(userId: string, id: string) {
  const event = await prisma.event.findFirst({
    where: { id, ownerId: userId },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      published: true,
      content: true,
      updatedAt: true,
    },
  });
  return event ? { ...event, content: readEventContent(event.content) } : null;
}

/** True for Prisma's unique constraint error (P2002). */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}
