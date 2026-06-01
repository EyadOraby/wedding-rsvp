import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guestName,
      email,
      attending,
      guestCount,
      mealOptionId,
      dietaryLabels,
      dietaryOther,
      message,
    } = body;

    if (!guestName?.trim()) {
      return NextResponse.json(
        { error: "Please enter your name" },
        { status: 400 },
      );
    }

    if (typeof attending !== "boolean") {
      return NextResponse.json(
        { error: "Please let us know if you can attend" },
        { status: 400 },
      );
    }

    if (attending && !mealOptionId) {
      return NextResponse.json(
        { error: "Please choose a meal option" },
        { status: 400 },
      );
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        guestName: guestName.trim(),
        email: email?.trim() || null,
        attending,
        guestCount: attending ? Math.max(1, Number(guestCount) || 1) : 0,
        mealOptionId: attending ? mealOptionId : null,
        dietaryLabels: Array.isArray(dietaryLabels) ? dietaryLabels : [],
        dietaryOther: dietaryOther?.trim() || null,
        message: message?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, id: rsvp.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to submit RSVP" },
      { status: 500 },
    );
  }
}
