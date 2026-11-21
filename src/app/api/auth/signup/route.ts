import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/accounts";
import { createUserSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { parseJson } from "@/lib/validation";

const HOUR = 60 * 60 * 1000;

export async function POST(request: Request) {
  const limit = rateLimit(`signup:${clientIp(request)}`, 10, HOUR);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many sign-ups from this network. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const parsed = await parseJson(request, signupSchema);
  if (!parsed.ok) return parsed.response;
  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      {
        error: "An account with this email already exists. Try logging in.",
        field: "email",
      },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
    select: { id: true },
  });
  await createUserSession(user.id);
  return NextResponse.json({ success: true }, { status: 201 });
}
