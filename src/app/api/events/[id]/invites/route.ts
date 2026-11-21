import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addInvitesSchema } from "@/lib/events/invites";
import { getOwnedEvent } from "@/lib/events/owner";
import { newToken } from "@/lib/events/tokens";
import { parseJson } from "@/lib/validation";

const MAX_INVITES_PER_EVENT = 1000;

/** Adds guests to the event's guest list, each with a personal link. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const { id } = await params;
  const event = await getOwnedEvent(auth.userId, id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  const parsed = await parseJson(request, addInvitesSchema);
  if (!parsed.ok) return parsed.response;

  const existing = await prisma.invite.count({ where: { eventId: event.id } });
  if (existing + parsed.data.invites.length > MAX_INVITES_PER_EVENT) {
    return NextResponse.json(
      { error: `A guest list can have up to ${MAX_INVITES_PER_EVENT} guests` },
      { status: 400 },
    );
  }

  const { count } = await prisma.invite.createMany({
    data: parsed.data.invites.map((invite) => ({
      ...invite,
      eventId: event.id,
      token: newToken(),
    })),
  });
  return NextResponse.json({ added: count }, { status: 201 });
}
