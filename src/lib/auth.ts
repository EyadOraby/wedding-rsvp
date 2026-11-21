import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  signUserToken,
  USER_SESSION_COOKIE,
  verifySessionToken,
  verifyUserToken,
} from "./session";

export async function createAdminSession(): Promise<void> {
  const token = await signSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/**
 * Returns a 401 response when the caller is not signed in, or null when the
 * request may continue. Every admin route handler calls this, so access does
 * not depend on the proxy alone.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdminAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Compares in constant time so response timing does not leak the password. */
export function verifyAdminPassword(password: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== "string") return false;
  const given = createHash("sha256").update(password).digest();
  const actual = createHash("sha256").update(expected).digest();
  return timingSafeEqual(given, actual);
}

/* Builder accounts */

const userCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};

export async function createUserSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(
    USER_SESSION_COOKIE,
    await signUserToken(userId),
    userCookieOptions,
  );
}

export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(USER_SESSION_COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return verifyUserToken(cookieStore.get(USER_SESSION_COOKIE)?.value);
}

/** The signed-in user for pages; sends everyone else to the login page. */
export async function requireUserPage(next = "/dashboard") {
  const userId = await getSessionUserId();
  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      })
    : null;
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/**
 * For route handlers: the signed-in user's id, or a 401 response. Every
 * owner route calls this, so access does not depend on the proxy alone.
 */
export async function requireUserApi(): Promise<
  | { userId: string; response?: never }
  | { userId?: never; response: NextResponse }
> {
  const userId = await getSessionUserId();
  if (userId) return { userId };
  return {
    response: NextResponse.json({ error: "Please log in" }, { status: 401 }),
  };
}
