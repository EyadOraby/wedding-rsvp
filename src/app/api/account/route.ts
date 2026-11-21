import { NextResponse } from "next/server";
import { z } from "zod";
import { nameSchema } from "@/lib/accounts";
import { clearUserSession, requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { parseJson } from "@/lib/validation";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

/** Updates the signed-in user's name. */
export async function PATCH(request: Request) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const parsed = await parseJson(request, z.object({ name: nameSchema }));
  if (!parsed.ok) return parsed.response;

  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { name: parsed.data.name },
    select: { name: true },
  });
  return NextResponse.json({ user });
}

/** Deletes the account with all of its events and replies. */
export async function DELETE(request: Request) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const limit = rateLimit(`account:${clientIp(request)}`, 10, FIFTEEN_MINUTES);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }
  const parsed = await parseJson(
    request,
    z.object({ password: z.string().min(1, "Enter your password").max(200) }),
  );
  if (!parsed.ok) return parsed.response;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { passwordHash: true },
  });
  if (
    !user ||
    !(await verifyPassword(parsed.data.password, user.passwordHash))
  ) {
    return NextResponse.json(
      { error: "That password is not correct", field: "password" },
      { status: 403 },
    );
  }

  await prisma.user.delete({ where: { id: auth.userId } });
  await clearUserSession();
  return NextResponse.json({ success: true });
}
