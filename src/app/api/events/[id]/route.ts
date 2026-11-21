import { NextResponse } from "next/server";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getOwnedEvent,
  isUniqueViolation,
  updateEventSchema,
} from "@/lib/events/owner";
import { parseJson } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

const notFound = () =>
  NextResponse.json({ error: "Event not found" }, { status: 404 });

/** Saves the builder: title, address, published state and all content. */
export async function PATCH(request: Request, { params }: Context) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!(await getOwnedEvent(auth.userId, id))) return notFound();

  const parsed = await parseJson(request, updateEventSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const event = await prisma.event.update({
      where: { id },
      data: parsed.data,
      select: { slug: true, published: true, updatedAt: true },
    });
    return NextResponse.json({ event });
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
    return NextResponse.json(
      { error: "That address is already taken", field: "slug" },
      { status: 409 },
    );
  }
}

/** Deletes the event and all of its replies. */
export async function DELETE(_request: Request, { params }: Context) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const { id } = await params;
  if (!(await getOwnedEvent(auth.userId, id))) return notFound();

  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
