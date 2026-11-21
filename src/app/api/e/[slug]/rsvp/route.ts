import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateReply } from "@/lib/events/answers";
import { readEventContent } from "@/lib/events/content";
import { isPastDeadline } from "@/lib/events/format";
import { findInvite } from "@/lib/events/invites";
import { newToken } from "@/lib/events/tokens";
import { isHoneypotFilled } from "@/lib/honeypot";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const HOUR = 60 * 60 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const limit = rateLimit(`rsvp:${slug}:${clientIp(request)}`, 20, HOUR);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many replies from this network. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    select: { id: true, published: true, content: true },
  });
  if (!event?.published) {
    return NextResponse.json(
      { error: "This event is not accepting replies" },
      { status: 404 },
    );
  }

  const content = readEventContent(event.content);
  if (isPastDeadline(content.rsvp.deadline)) {
    return NextResponse.json(
      { error: "Replies for this event are closed" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // The form has a hidden "website" field; only bots fill it in. Pretend it
  // worked so they do not retry, but save nothing.
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const result = validateReply(content, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, field: result.field },
      { status: 400 },
    );
  }

  // Replies from a personal invitation link are tied to that invitation.
  const invite = await findInvite(event.id, body);
  if (invite?.maxGuests && result.data.guestCount > invite.maxGuests) {
    return NextResponse.json(
      {
        error: `Your invitation is for ${invite.maxGuests} ${invite.maxGuests === 1 ? "person" : "people"}`,
        field: "guestCount",
      },
      { status: 400 },
    );
  }

  const editToken = newToken();
  await prisma.reply.create({
    data: {
      eventId: event.id,
      ...result.data,
      editToken,
      inviteId: invite?.id,
    },
  });
  return NextResponse.json(
    { success: true, editPath: `/e/${slug}/reply/${editToken}` },
    { status: 201 },
  );
}
