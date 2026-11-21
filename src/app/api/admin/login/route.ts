import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminPassword } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: Request) {
  const limit = rateLimit(
    `login:${clientIp(request)}`,
    MAX_ATTEMPTS,
    WINDOW_MS,
  );
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  try {
    await createAdminSession();
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Admin login is not configured on the server" },
      { status: 500 },
    );
  }
  return NextResponse.json({ success: true });
}
