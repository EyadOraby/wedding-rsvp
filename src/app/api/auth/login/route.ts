import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/accounts";
import { createUserSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDummyHash, verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { parseJson } from "@/lib/validation";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export async function POST(request: Request) {
  const limit = rateLimit(`login:${clientIp(request)}`, 10, FIFTEEN_MINUTES);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const parsed = await parseJson(request, loginSchema);
  if (!parsed.ok) return parsed.response;
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });
  // Check a dummy hash for unknown emails so both cases take the same time.
  const valid = await verifyPassword(
    password,
    user?.passwordHash ?? (await getDummyHash()),
  );
  if (!user || !valid) {
    return NextResponse.json(
      { error: "Email or password is incorrect" },
      { status: 401 },
    );
  }

  await createUserSession(user.id);
  return NextResponse.json({ success: true });
}
