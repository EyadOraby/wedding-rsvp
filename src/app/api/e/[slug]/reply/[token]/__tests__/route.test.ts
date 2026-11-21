import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFromTemplate } from "@/lib/events/templates";
import { resetRateLimits } from "@/lib/rate-limit";

const prisma = vi.hoisted(() => ({
  reply: { findFirst: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma }));

import { PATCH } from "../route";

const content = buildFromTemplate("wedding").content;
const TOKEN = "abcdefghijklmnopqrstuvwx";

function patch(body: unknown, slug = "alex-sam", token = TOKEN) {
  return PATCH(
    new Request(`http://localhost/api/e/${slug}/reply/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug, token }) },
  );
}

const reply = (event: Record<string, unknown> = {}) => ({
  id: "reply_1",
  event: { slug: "alex-sam", published: true, content, ...event },
});

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimits();
  prisma.reply.findFirst.mockResolvedValue(reply());
});

describe("PATCH /api/e/[slug]/reply/[token]", () => {
  it("updates the reply that owns the token", async () => {
    const res = await patch({ name: "Sara", attending: false });
    expect(res.status).toBe(200);
    expect(prisma.reply.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { editToken: TOKEN } }),
    );
    expect(prisma.reply.update).toHaveBeenCalledWith({
      where: { id: "reply_1" },
      data: expect.objectContaining({
        name: "Sara",
        attending: false,
        guestCount: 0,
      }),
    });
  });

  it("rejects malformed tokens without a lookup", async () => {
    expect((await patch({}, "alex-sam", "short")).status).toBe(404);
    expect(prisma.reply.findFirst).not.toHaveBeenCalled();
  });

  it("returns 404 for another event's slug or an unpublished event", async () => {
    expect((await patch({ name: "S", attending: false }, "other")).status).toBe(
      404,
    );
    prisma.reply.findFirst.mockResolvedValueOnce(reply({ published: false }));
    expect((await patch({ name: "S", attending: false })).status).toBe(404);
    expect(prisma.reply.update).not.toHaveBeenCalled();
  });

  it("closes edits after the deadline and validates answers", async () => {
    const closed = structuredClone(content);
    closed.rsvp.deadline = "2000-01-01";
    prisma.reply.findFirst.mockResolvedValueOnce(reply({ content: closed }));
    expect((await patch({ name: "S", attending: false })).status).toBe(403);
    expect(
      (await patch({ name: "S", attending: true, answers: {} })).status,
    ).toBe(400);
  });
});
