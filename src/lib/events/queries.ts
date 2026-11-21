import { cache } from "react";
import { prisma } from "@/lib/db";
import { readEventContent } from "./content";

/** One event by its public slug, with its content parsed. */
export const getEventBySlug = cache(async (slug: string) => {
  const event = await prisma.event.findUnique({
    where: { slug },
    select: {
      id: true,
      ownerId: true,
      slug: true,
      title: true,
      type: true,
      published: true,
      content: true,
    },
  });
  return event ? { ...event, content: readEventContent(event.content) } : null;
});
