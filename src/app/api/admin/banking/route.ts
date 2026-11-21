import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { bankingSchema, parseJson } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const banking = await prisma.bankingInfo.findUnique({
    where: { id: "default" },
  });
  return NextResponse.json(banking);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = await parseJson(request, bankingSchema);
  if (!parsed.ok) return parsed.response;
  const banking = await prisma.bankingInfo.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  return NextResponse.json(banking);
}
