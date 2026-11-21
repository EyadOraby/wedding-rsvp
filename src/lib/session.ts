import { SignJWT, jwtVerify } from "jose";

/**
 * Session tokens for signed-in hosts. This module has no Next.js request
 * APIs in it, so both the proxy and route handlers can use it.
 */

export const USER_SESSION_COOKIE = "rsvp_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

const MIN_SECRET_LENGTH = 32;

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `SESSION_SECRET must be set to at least ${MIN_SECRET_LENGTH} characters`,
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signUserToken(userId: string): Promise<string> {
  return new SignJWT({ role: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

/** Returns the user id from a valid token, or null. */
export async function verifyUserToken(
  token: string | undefined,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSessionSecret(), {
      algorithms: ["HS256"],
    });
    return payload.role === "user" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
