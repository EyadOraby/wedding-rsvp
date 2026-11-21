import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFromTemplate } from "@/lib/events/templates";
import { resetRateLimits } from "@/lib/rate-limit";

const prisma = vi.hoisted(() => ({
  event: { findUnique: vi.fn() },
  reply: { create: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma }));

import { POST } from "../route";

const content = buildFromTemplate("wedding").content;

function post(body: unknown, slug = "alex-sam") {
  return POST(
    new Request(`http://localhost/api/e/${slug}/rsvp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "192.0.2.10",
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
    { params: Promise.resolve({ slug }) },
  );
}

const attending = {
  name: "Sara",
  attending: true,
  guestCount: 2,
  answers: { q_meal: "opt_1" },
};

describe("POST /api/e/[slug]/rsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    prisma.event.findUnique.mockResolvedValue({
      id: "event_1",
      published: true,
      content,
    });
    prisma.reply.create.mockResolvedValue({ id: "reply_1" });
  });

  it("saves a valid reply to the event", async () => {
    const res = await post(attending);
    expect(res.status).toBe(201);
    expect(prisma.reply.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventId: "event_1",
        name: "Sara",
        guestCount: 2,
        answers: { q_meal: "opt_1" },
      }),
    });
  });

  it("returns 404 for drafts and unknown events", async () => {
    prisma.event.findUnique.mockResolvedValueOnce({
      id: "event_1",
      published: false,
      content,
    });
    expect((await post(attending)).status).toBe(404);
    prisma.event.findUnique.mockResolvedValueOnce(null);
    expect((await post(attending)).status).toBe(404);
    expect(prisma.reply.create).not.toHaveBeenCalled();
  });

  it("closes replies after the deadline", async () => {
    const closed = structuredClone(content);
    closed.rsvp.deadline = "2000-01-01";
    prisma.event.findUnique.mockResolvedValue({
      id: "event_1",
      published: true,
      content: closed,
    });
    expect((await post(attending)).status).toBe(403);
  });

  it("validates against the event's own questions", async () => {
    const res = await post({ ...attending, answers: {} });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ field: "answers.q_meal" });
  });

  it("returns 400 for invalid JSON", async () => {
    expect((await post("{")).status).toBe(400);
  });

  it("rate-limits one network per event", async () => {
    for (let i = 0; i < 20; i++) await post(attending);
    expect((await post(attending)).status).toBe(429);
    expect((await post(attending, "other-event")).status).toBe(201);
  });

  it("pretends to accept bot replies that fill the hidden field, but saves nothing", async () => {
    const res = await post({ ...attending, website: "http://spam.example" });
    expect(res.status).toBe(201);
    expect(prisma.reply.create).not.toHaveBeenCalled();
  });

  it("ignores an empty hidden field", async () => {
    expect((await post({ ...attending, website: "" })).status).toBe(201);
    expect(prisma.reply.create).toHaveBeenCalledTimes(1);
  });
});
