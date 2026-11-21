import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFromTemplate } from "@/lib/events/templates";
import { hashPassword } from "@/lib/password";
import { resetRateLimits } from "@/lib/rate-limit";

const prisma = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
  event: { findFirst: vi.fn(), create: vi.fn() },
}));
const auth = vi.hoisted(() => ({
  requireUserApi: vi.fn(),
  clearUserSession: vi.fn(),
}));
vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/auth", () => auth);

import { POST as duplicate } from "../../events/[id]/duplicate/route";
import { POST as changePassword } from "../password/route";
import { DELETE as deleteAccount, PATCH as updateAccount } from "../route";

const req = (method: string, body?: unknown) =>
  new Request("http://localhost/api/account", {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "198.51.100.9",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

let storedHash: string;

beforeEach(async () => {
  vi.clearAllMocks();
  resetRateLimits();
  auth.requireUserApi.mockResolvedValue({ userId: "user_1" });
  storedHash ??= await hashPassword("correct horse");
  prisma.user.findUnique.mockResolvedValue({ passwordHash: storedHash });
});

describe("PATCH /api/account", () => {
  it("updates the signed-in user's name", async () => {
    prisma.user.update.mockResolvedValue({ name: "Eyad" });
    const res = await updateAccount(req("PATCH", { name: "  Eyad " }));
    expect(res.status).toBe(200);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user_1" },
        data: { name: "Eyad" },
      }),
    );
  });

  it("rejects an empty name and signed-out users", async () => {
    expect((await updateAccount(req("PATCH", { name: " " }))).status).toBe(400);
    auth.requireUserApi.mockResolvedValueOnce({
      response: NextResponse.json({}, { status: 401 }),
    });
    expect((await updateAccount(req("PATCH", { name: "X" }))).status).toBe(401);
  });
});

describe("POST /api/account/password", () => {
  it("changes the password when the current one is right", async () => {
    const res = await changePassword(
      req("POST", {
        currentPassword: "correct horse",
        newPassword: "new long one",
      }),
    );
    expect(res.status).toBe(200);
    const data = prisma.user.update.mock.calls[0][0].data;
    expect(data.passwordHash).toMatch(/^scrypt\$/);
    expect(data.passwordHash).not.toBe(storedHash);
  });

  it("refuses a wrong current password or a short new one", async () => {
    const wrong = await changePassword(
      req("POST", { currentPassword: "nope", newPassword: "new long one" }),
    );
    expect(wrong.status).toBe(403);
    const short = await changePassword(
      req("POST", { currentPassword: "correct horse", newPassword: "short" }),
    );
    expect(short.status).toBe(400);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/account", () => {
  it("deletes the account and signs out with the right password", async () => {
    const res = await deleteAccount(
      req("DELETE", { password: "correct horse" }),
    );
    expect(res.status).toBe(200);
    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user_1" },
    });
    expect(auth.clearUserSession).toHaveBeenCalled();
  });

  it("keeps the account when the password is wrong", async () => {
    const res = await deleteAccount(req("DELETE", { password: "nope" }));
    expect(res.status).toBe(403);
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});

describe("POST /api/events/[id]/duplicate", () => {
  const params = { params: Promise.resolve({ id: "event_1" }) };
  const wedding = buildFromTemplate("wedding");

  it("copies the content into a new unpublished draft", async () => {
    prisma.event.findFirst.mockResolvedValue({
      id: "event_1",
      type: "wedding",
      slug: "alex-sam",
      published: true,
      ...wedding,
    });
    prisma.event.create.mockResolvedValue({ id: "event_2" });
    const res = await duplicate(req("POST"), params);
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "event_2" });
    const data = prisma.event.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      ownerId: "user_1",
      title: "Copy of Alex & Sam",
      published: false,
      content: wedding.content,
    });
    expect(data.slug).not.toBe("alex-sam");
  });

  it("returns 404 for someone else's event", async () => {
    prisma.event.findFirst.mockResolvedValue(null);
    expect((await duplicate(req("POST"), params)).status).toBe(404);
    expect(prisma.event.create).not.toHaveBeenCalled();
  });
});
