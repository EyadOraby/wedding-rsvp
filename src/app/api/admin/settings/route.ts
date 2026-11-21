import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseJson, settingsSchema } from "@/lib/validation";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const parsed = await parseJson(request, settingsSchema);
  if (!parsed.ok) return parsed.response;
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: parsed.data,
    create: { id: "default", ...parsed.data },
  });
  return NextResponse.json(settings);
}
