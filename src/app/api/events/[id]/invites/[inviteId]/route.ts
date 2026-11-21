import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOwnedEvent } from "@/lib/events/owner";

/** Removes a guest from the list. Their reply, if any, is kept. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; inviteId: string }> },
) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const { id, inviteId } = await params;
  const event = await getOwnedEvent(auth.userId, id);
  const { count } = event
    ? await prisma.invite.deleteMany({
        where: { id: inviteId, eventId: event.id },
      })
    : { count: 0 };
  if (count === 0) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
