import { randomBytes } from "node:crypto";

/** Unguessable token for private links (reply edits, personal invites). */
export function newToken(): string {
  return randomBytes(18).toString("base64url");
}

/** Tokens are 24 URL-safe characters; anything else is rejected early. */
export function isToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{24}$/.test(value);
}
