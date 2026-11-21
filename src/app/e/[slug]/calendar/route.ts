import { NextResponse } from "next/server";
import { buildIcs } from "@/lib/events/ics";
import { getEventBySlug } from "@/lib/events/queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  const ics =
    event?.published &&
    buildIcs({
      title: event.title,
      slug: event.slug,
      url: new URL(`/e/${event.slug}`, request.url).toString(),
      content: event.content,
    });
  if (!ics) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
