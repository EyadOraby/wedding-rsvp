import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/password";
import { resetRateLimits } from "@/lib/rate-limit";

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
}));
const auth = vi.hoisted(() => ({ createUserSession: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/auth", () => auth);

import { POST as login } from "../login/route";
import { POST as signup } from "../signup/route";

function post(handler: (r: Request) => Promise<Response>, body: unknown) {
  return handler(
    new Request("http://localhost/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "203.0.113.7",
      },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimits();
});

describe("POST /api/auth/signup", () => {
  const valid = {
    name: "Eyad",
    email: "Eyad@Example.com",
    password: "long enough",
  };

  it("creates the account with a hashed password and signs in", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: "user_1" });
    const res = await post(signup, valid);
    expect(res.status).toBe(201);
    const data = prisma.user.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ name: "Eyad", email: "eyad@example.com" });
    expect(data.passwordHash).toMatch(/^scrypt\$/);
    expect(data.passwordHash).not.toContain("long enough");
    expect(auth.createUserSession).toHaveBeenCalledWith("user_1");
  });

  it("refuses an email that already has an account", async () => {
    prisma.user.findUnique.mockResolvedValue({ id: "user_1" });
    const res = await post(signup, valid);
    expect(res.status).toBe(409);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it("rejects short passwords", async () => {
    const res = await post(signup, { ...valid, password: "short" });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ field: "password" });
  });
});

describe("POST /api/auth/login", () => {
  it("signs in with the right password", async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: "user_1",
      passwordHash: await hashPassword("correct horse"),
    });
    const res = await post(login, {
      email: "a@b.co",
      password: "correct horse",
    });
    expect(res.status).toBe(200);
    expect(auth.createUserSession).toHaveBeenCalledWith("user_1");
  });

  it("gives the same answer for a wrong password and an unknown email", async () => {
    prisma.user.findUnique.mockResolvedValueOnce({
      id: "user_1",
      passwordHash: await hashPassword("correct horse"),
    });
    const wrong = await post(login, { email: "a@b.co", password: "nope" });
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const unknown = await post(login, { email: "x@b.co", password: "nope" });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(await wrong.json()).toEqual(await unknown.json());
    expect(auth.createUserSession).not.toHaveBeenCalled();
  });

  it("rate-limits repeated attempts", async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    for (let i = 0; i < 10; i++) {
      await post(login, { email: "a@b.co", password: "nope" });
    }
    const blocked = await post(login, { email: "a@b.co", password: "nope" });
    expect(blocked.status).toBe(429);
  });
});
