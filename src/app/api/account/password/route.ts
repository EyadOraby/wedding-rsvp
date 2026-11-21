import { NextResponse } from "next/server";
import { z } from "zod";
import { passwordSchema } from "@/lib/accounts";
import { requireUserApi } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { parseJson } from "@/lib/validation";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password").max(200),
  newPassword: passwordSchema,
});

/** Changes the password after checking the current one. */
export async function POST(request: Request) {
  const auth = await requireUserApi();
  if (auth.response) return auth.response;
  const limit = rateLimit(`password:${clientIp(request)}`, 10, FIFTEEN_MINUTES);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }
  const parsed = await parseJson(request, changePasswordSchema);
  if (!parsed.ok) return parsed.response;
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { passwordHash: true },
  });
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    return NextResponse.json(
      {
        error: "Your current password is not correct",
        field: "currentPassword",
      },
      { status: 403 },
    );
  }

  await prisma.user.update({
    where: { id: auth.userId },
    data: { passwordHash: await hashPassword(newPassword) },
  });
  return NextResponse.json({ success: true });
}
