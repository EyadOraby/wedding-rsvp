import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOwnedEvent, isUniqueViolation } from "@/lib/events/owner";
import { suggestSlug } from "@/lib/events/slug";

const SLUG_ATTEMPTS = 5;
const MAX_TITLE = 120;

/** Copies an event (not its replies) into a new draft. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const { id } = await params;
  const event = await getOwnedEvent(auth.userId, id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const title = `Copy of ${event.title}`.slice(0, MAX_TITLE);
  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt++) {
    try {
      const copy = await prisma.event.create({
        data: {
          ownerId: auth.userId,
          type: event.type,
          title,
          slug: suggestSlug(event.title),
          published: false,
          content: event.content,
        },
        select: { id: true },
      });
      return NextResponse.json({ id: copy.id }, { status: 201 });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  return NextResponse.json(
    { error: "Could not copy the event. Please try again." },
    { status: 500 },
  );
}
