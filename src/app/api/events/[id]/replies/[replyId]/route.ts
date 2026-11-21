import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOwnedEvent } from "@/lib/events/owner";

/** Removes one reply, e.g. a duplicate or a test entry. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; replyId: string }> },
) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const { id, replyId } = await params;
  const event = await getOwnedEvent(auth.userId, id);
  // The reply must belong to this event, which must belong to the user.
  const { count } = event
    ? await prisma.reply.deleteMany({
        where: { id: replyId, eventId: event.id },
      })
    : { count: 0 };
  if (count === 0) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
