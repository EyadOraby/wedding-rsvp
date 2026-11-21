import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateReply } from "@/lib/events/answers";
import { readEventContent } from "@/lib/events/content";
import { isPastDeadline } from "@/lib/events/format";
import { isToken } from "@/lib/events/tokens";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const HOUR = 60 * 60 * 1000;

/** Updates a reply from the guest's private edit link. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string; token: string }> },
) {
  const { slug, token } = await params;
  const limit = rateLimit(`edit:${clientIp(request)}`, 30, HOUR);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many changes. Try again later." },
      { status: 429 },
    );
  }

  const reply = isToken(token)
    ? await prisma.reply.findFirst({
        where: { editToken: token },
        select: {
          id: true,
          event: { select: { slug: true, published: true, content: true } },
        },
      })
    : null;
  if (!reply || reply.event.slug !== slug || !reply.event.published) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  const content = readEventContent(reply.event.content);
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

  await prisma.reply.update({ where: { id: reply.id }, data: result.data });
  return NextResponse.json({ success: true });
}
