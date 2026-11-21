import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createEventSchema, isUniqueViolation } from "@/lib/events/owner";
import { suggestSlug } from "@/lib/events/slug";
import { buildFromTemplate } from "@/lib/events/templates";
import { parseJson } from "@/lib/validation";

const SLUG_ATTEMPTS = 5;

/** Creates a draft event from a template. */
export async function POST(request: Request) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;

  const parsed = await parseJson(request, createEventSchema);
  if (!parsed.ok) return parsed.response;
  const { type } = parsed.data;
  const { title, content } = buildFromTemplate(type);

  // Slugs get a random suffix; try again in the rare case it is taken.
  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt++) {
    try {
      const event = await prisma.event.create({
        data: {
          ownerId: auth.userId,
          type,
          title,
          slug: suggestSlug(title),
          content,
        },
        select: { id: true },
      });
      return NextResponse.json({ id: event.id }, { status: 201 });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  return NextResponse.json(
    { error: "Could not create the event. Please try again." },
    { status: 500 },
  );
}
