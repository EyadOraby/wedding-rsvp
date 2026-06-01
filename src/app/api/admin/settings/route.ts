import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  const body = await request.json();
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      initials: body.initials,
      coupleNames: body.coupleNames,
      weddingDate: body.weddingDate,
      location: body.location,
      heroImageUrl: body.heroImageUrl,
      rsvpHeading: body.rsvpHeading,
      bankingHeading: body.bankingHeading,
    },
    create: {
      initials: body.initials,
      coupleNames: body.coupleNames,
      weddingDate: body.weddingDate,
      location: body.location,
      heroImageUrl: body.heroImageUrl,
      rsvpHeading: body.rsvpHeading,
      bankingHeading: body.bankingHeading,
    },
  });
  return NextResponse.json(settings);
}
