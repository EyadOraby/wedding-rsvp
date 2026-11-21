import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { signSessionToken, verifySessionToken } from "../session";
import { verifyAdminPassword } from "../auth";

describe("session tokens", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-secret-that-is-at-least-32-characters");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("verifies a token it signed", async () => {
    const token = await signSessionToken();
    await expect(verifySessionToken(token)).resolves.toBe(true);
  });

  it("rejects tokens signed with a different secret", async () => {
    const token = await signSessionToken();
    vi.stubEnv("SESSION_SECRET", "another-secret-that-is-also-32-characters!");
    await expect(verifySessionToken(token)).resolves.toBe(false);
  });

  it("rejects missing and malformed tokens", async () => {
    await expect(verifySessionToken(undefined)).resolves.toBe(false);
    await expect(verifySessionToken("not.a.jwt")).resolves.toBe(false);
  });

  it("refuses to sign with a short secret", async () => {
    vi.stubEnv("SESSION_SECRET", "too-short");
    await expect(signSessionToken()).rejects.toThrow(/SESSION_SECRET/);
  });
});

describe("verifyAdminPassword", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts only the configured password", () => {
    vi.stubEnv("ADMIN_PASSWORD", "correct horse");
    expect(verifyAdminPassword("correct horse")).toBe(true);
    expect(verifyAdminPassword("wrong")).toBe(false);
    expect(verifyAdminPassword(undefined)).toBe(false);
  });

  it("rejects everything when no password is configured", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    expect(verifyAdminPassword("")).toBe(false);
  });
});
