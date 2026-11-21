import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseGuestLines } from "@/lib/events/invites";
import { buildFromTemplate } from "@/lib/events/templates";
import { resetRateLimits } from "@/lib/rate-limit";

const prisma = vi.hoisted(() => ({
  event: { findFirst: vi.fn(), findUnique: vi.fn() },
  invite: {
    count: vi.fn(),
    createMany: vi.fn(),
    deleteMany: vi.fn(),
    findFirst: vi.fn(),
  },
  reply: { create: vi.fn() },
}));
const auth = vi.hoisted(() => ({ requireUserApi: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/auth", () => auth);

import { POST as rsvp } from "../../e/[slug]/rsvp/route";
import { DELETE as removeInvite } from "../[id]/invites/[inviteId]/route";
import { POST as addInvites } from "../[id]/invites/route";

const wedding = buildFromTemplate("wedding");
const json = (method: string, body?: unknown) =>
  new Request("http://localhost/api", {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "192.0.2.50",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const ctx = { params: Promise.resolve({ id: "event_1" }) };
const TOKEN = "invitetokeninvitetoken12";

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimits();
  auth.requireUserApi.mockResolvedValue({ userId: "user_1" });
  prisma.event.findFirst.mockResolvedValue({
    id: "event_1",
    slug: "alex-sam",
    ...wedding,
  });
  prisma.invite.count.mockResolvedValue(0);
});

describe("parseGuestLines", () => {
  it("reads names, emails and party sizes in any order", () => {
    expect(
      parseGuestLines(
        "Sara Ahmed, sara@example.com, 2\n\nOmar Khaled\nLina;1;lina@example.com",
      ),
    ).toEqual([
      { name: "Sara Ahmed", email: "sara@example.com", maxGuests: 2 },
      { name: "Omar Khaled", email: null, maxGuests: null },
      { name: "Lina", email: "lina@example.com", maxGuests: 1 },
    ]);
  });
});

describe("guest list API", () => {
  it("adds guests with their own tokens", async () => {
    prisma.invite.createMany.mockResolvedValue({ count: 2 });
    const res = await addInvites(
      json("POST", {
        invites: [
          { name: "Sara", email: "sara@example.com", maxGuests: 2 },
          { name: "Omar" },
        ],
      }),
      ctx,
    );
    expect(res.status).toBe(201);
    const data = prisma.invite.createMany.mock.calls[0][0].data;
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      eventId: "event_1",
      name: "Sara",
      maxGuests: 2,
    });
    expect(data[0].token).toHaveLength(24);
    expect(data[0].token).not.toBe(data[1].token);
  });

  it("rejects bad input and other users' events", async () => {
    expect(
      (await addInvites(json("POST", { invites: [{ name: "" }] }), ctx)).status,
    ).toBe(400);
    prisma.event.findFirst.mockResolvedValueOnce(null);
    expect(
      (await addInvites(json("POST", { invites: [{ name: "A" }] }), ctx))
        .status,
    ).toBe(404);
  });

  it("removes a guest only from the user's own event", async () => {
    prisma.invite.deleteMany.mockResolvedValue({ count: 1 });
    const params = {
      params: Promise.resolve({ id: "event_1", inviteId: "inv_1" }),
    };
    expect((await removeInvite(json("DELETE"), params)).status).toBe(200);
    expect(prisma.invite.deleteMany).toHaveBeenCalledWith({
      where: { id: "inv_1", eventId: "event_1" },
    });
  });
});

describe("replying from a personal link", () => {
  const post = (body: unknown) =>
    rsvp(json("POST", body), { params: Promise.resolve({ slug: "alex-sam" }) });

  beforeEach(() => {
    prisma.event.findUnique.mockResolvedValue({
      id: "event_1",
      published: true,
      content: wedding.content,
    });
    prisma.reply.create.mockResolvedValue({ id: "reply_1" });
  });

  it("links the reply to the invitation", async () => {
    prisma.invite.findFirst.mockResolvedValue({ id: "inv_1", maxGuests: 2 });
    const res = await post({
      name: "Sara",
      attending: false,
      inviteToken: TOKEN,
    });
    expect(res.status).toBe(201);
    expect(prisma.invite.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { eventId: "event_1", token: TOKEN } }),
    );
    expect(prisma.reply.create.mock.calls[0][0].data.inviteId).toBe("inv_1");
  });

  it("caps the party at the invitation's size", async () => {
    prisma.invite.findFirst.mockResolvedValue({ id: "inv_1", maxGuests: 1 });
    const res = await post({
      name: "Sara",
      attending: true,
      guestCount: 2,
      answers: { q_meal: "opt_1" },
      inviteToken: TOKEN,
    });
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({
      error: "Your invitation is for 1 person",
    });
  });
});
