import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  dietaryCreateSchema,
  dietaryUpdateSchema,
  parseJson,
} from "@/lib/validation";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const options = await prisma.dietaryOption.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(options);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = await parseJson(request, dietaryCreateSchema);
  if (!parsed.ok) return parsed.response;
  const option = await prisma.dietaryOption.create({ data: parsed.data });
  return NextResponse.json(option);
}

export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = await parseJson(request, dietaryUpdateSchema);
  if (!parsed.ok) return parsed.response;
  const { id, ...data } = parsed.data;
  const option = await prisma.dietaryOption.update({ where: { id }, data });
  return NextResponse.json(option);
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.dietaryOption.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
