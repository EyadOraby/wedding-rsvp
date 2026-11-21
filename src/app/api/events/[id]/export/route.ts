import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { kitchenToCsv, repliesToCsv } from "@/lib/events/csv";
import { getOwnedEvent } from "@/lib/events/owner";

/** Downloads every reply to the event as a CSV file. */
export async function GET(
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

  const replies = await prisma.reply.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
  });
  // ?view=kitchen gives the caterer only guests who are coming and their food answers.
  const kitchen = new URL(request.url).searchParams.get("view") === "kitchen";
  const csv = kitchen
    ? kitchenToCsv(event.content, replies)
    : repliesToCsv(event.content, replies);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}-${kitchen ? "kitchen" : "replies"}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
