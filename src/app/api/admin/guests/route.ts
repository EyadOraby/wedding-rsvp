import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const guests = await prisma.rsvp.findMany({
    include: { mealOption: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(guests);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.rsvp.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
