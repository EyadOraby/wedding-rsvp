import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const meals = await prisma.mealOption.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(meals);
}

export async function POST(request: Request) {
  const body = await request.json();
  const meal = await prisma.mealOption.create({
    data: {
      title: body.title,
      description: body.description,
      tag: body.tag || null,
      sortOrder: body.sortOrder ?? 0,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(meal);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const meal = await prisma.mealOption.update({
    where: { id: body.id },
    data: {
      title: body.title,
      description: body.description,
      tag: body.tag,
      sortOrder: body.sortOrder,
      active: body.active,
    },
  });
  return NextResponse.json(meal);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  await prisma.mealOption.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
