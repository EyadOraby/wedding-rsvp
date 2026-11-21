import { beforeEach, describe, expect, it, vi } from "vitest";
import { safeNextPath, signupSchema } from "../accounts";
import { hashPassword, verifyPassword } from "../password";
import { SignJWT } from "jose";
import { signUserToken, verifyUserToken } from "../session";

describe("passwords", () => {
  it("verifies the right password and rejects others", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).toMatch(/^scrypt\$16384\$8\$1\$/);
    expect(await verifyPassword("correct horse", hash)).toBe(true);
    expect(await verifyPassword("wrong horse", hash)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects malformed hashes instead of throwing", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$abc")).toBe(false);
  });
});

describe("user sessions", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "a-test-secret-that-is-long-enough-1234");
  });

  it("round-trips the user id", async () => {
    expect(await verifyUserToken(await signUserToken("user_1"))).toBe("user_1");
  });

  it("rejects tokens without the user role", async () => {
    const token = await new SignJWT({ role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject("user_1")
      .sign(new TextEncoder().encode(process.env.SESSION_SECRET));
    expect(await verifyUserToken(token)).toBeNull();
  });

  it("rejects tokens signed with another secret", async () => {
    const token = await signUserToken("user_1");
    vi.stubEnv("SESSION_SECRET", "another-secret-that-is-long-enough-5678");
    expect(await verifyUserToken(token)).toBeNull();
    expect(await verifyUserToken(undefined)).toBeNull();
  });
});

describe("accounts", () => {
  it("normalises email addresses", () => {
    const parsed = signupSchema.parse({
      name: " Eyad ",
      email: " Eyad@Example.COM ",
      password: "long enough",
    });
    expect(parsed).toMatchObject({ name: "Eyad", email: "eyad@example.com" });
  });

  it("only redirects to same-site paths after login", () => {
    expect(safeNextPath("/dashboard/events/1")).toBe("/dashboard/events/1");
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(safeNextPath(undefined)).toBe("/dashboard");
  });
});
