import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  const body = await request.json();
  const banking = await prisma.bankingInfo.upsert({
    where: { id: "default" },
    update: {
      accountName: body.accountName,
      bankName: body.bankName,
      accountNumber: body.accountNumber,
      branchCode: body.branchCode,
      notes: body.notes,
      active: body.active,
    },
    create: {
      accountName: body.accountName,
      bankName: body.bankName,
      accountNumber: body.accountNumber,
      branchCode: body.branchCode,
      notes: body.notes,
      active: body.active ?? true,
    },
  });
  return NextResponse.json(banking);
}
