import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  mealCreateSchema,
  mealUpdateSchema,
  parseJson,
} from "@/lib/validation";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const meals = await prisma.mealOption.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(meals);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = await parseJson(request, mealCreateSchema);
  if (!parsed.ok) return parsed.response;
  const meal = await prisma.mealOption.create({ data: parsed.data });
  return NextResponse.json(meal);
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = await parseJson(request, mealUpdateSchema);
  if (!parsed.ok) return parsed.response;
  const { id, ...data } = parsed.data;
  const meal = await prisma.mealOption.update({ where: { id }, data });
  return NextResponse.json(meal);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.mealOption.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
