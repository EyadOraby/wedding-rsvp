import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const options = await prisma.dietaryOption.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(options);
}

export async function POST(request: Request) {
  const body = await request.json();
  const option = await prisma.dietaryOption.create({
    data: {
      label: body.label,
      sortOrder: body.sortOrder ?? 0,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(option);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const option = await prisma.dietaryOption.update({
    where: { id: body.id },
    data: {
      label: body.label,
      sortOrder: body.sortOrder,
      active: body.active,
    },
  });
  return NextResponse.json(option);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.dietaryOption.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
