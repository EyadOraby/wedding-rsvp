import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJson, rsvpSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = await parseJson(request, rsvpSchema);
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  try {
    if (input.attending) {
      const meal = await prisma.mealOption.findFirst({
        where: { id: input.mealOptionId ?? "", active: true },
        select: { id: true },
      });
      if (!meal) {
        return NextResponse.json(
          {
            error: "That meal option is no longer available",
            field: "mealOptionId",
          },
          { status: 400 },
        );
      }
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        guestName: input.guestName,
        email: input.email,
        attending: input.attending,
        guestCount: input.attending ? input.guestCount : 0,
        mealOptionId: input.attending ? (input.mealOptionId ?? null) : null,
        dietaryLabels: input.attending ? input.dietaryLabels : [],
        dietaryOther: input.attending ? input.dietaryOther : null,
        message: input.message,
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
