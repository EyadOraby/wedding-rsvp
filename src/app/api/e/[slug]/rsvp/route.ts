import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateReply } from "@/lib/events/answers";
import { readEventContent } from "@/lib/events/content";
import { isPastDeadline } from "@/lib/events/format";
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

  const result = validateReply(content, body);
  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, field: result.field },
      { status: 400 },
    );
  }

  await prisma.reply.create({ data: { eventId: event.id, ...result.data } });
  return NextResponse.json({ success: true }, { status: 201 });
}
