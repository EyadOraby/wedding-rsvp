import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import {
  SESSION_MAX_AGE_SECONDS,
  signUserToken,
  USER_SESSION_COOKIE,
  verifyUserToken,
} from "./session";

export async function createUserSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(USER_SESSION_COOKIE, await signUserToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
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
