import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFromTemplate } from "@/lib/events/templates";

const prisma = vi.hoisted(() => ({
  event: { findFirst: vi.fn() },
  reply: { findMany: vi.fn(), deleteMany: vi.fn() },
}));
const auth = vi.hoisted(() => ({ requireUserApi: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/auth", () => auth);

import { GET } from "../[id]/export/route";
import { DELETE } from "../[id]/replies/[replyId]/route";

const event = {
  id: "event_1",
  slug: "alex-sam",
  ...buildFromTemplate("wedding"),
};
const req = new Request("http://localhost/api/events/event_1");

beforeEach(() => {
  vi.clearAllMocks();
  auth.requireUserApi.mockResolvedValue({ userId: "user_1" });
  prisma.event.findFirst.mockResolvedValue(event);
});

describe("GET /api/events/[id]/export", () => {
  it("downloads the replies as CSV", async () => {
    prisma.reply.findMany.mockResolvedValue([
      {
        name: "Sara",
        email: null,
        attending: true,
        guestCount: 2,
        message: null,
        answers: { q_meal: "opt_2" },
        createdAt: new Date("2027-01-01T00:00:00Z"),
      },
    ]);
    const res = await GET(req, { params: Promise.resolve({ id: "event_1" }) });
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain(
      "alex-sam-replies.csv",
    );
    const body = await res.text();
    expect(body).toContain("Meal choice");
    expect(body).toContain("Sara,,Yes,2,Fish");
    expect(prisma.reply.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { eventId: "event_1" } }),
    );
  });

  it("returns 404 for someone else's event", async () => {
    prisma.event.findFirst.mockResolvedValueOnce(null);
    const res = await GET(req, { params: Promise.resolve({ id: "event_1" }) });
    expect(res.status).toBe(404);
    expect(prisma.reply.findMany).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/events/[id]/replies/[replyId]", () => {
  const params = Promise.resolve({ id: "event_1", replyId: "reply_1" });

  it("deletes a reply that belongs to the event", async () => {
    prisma.reply.deleteMany.mockResolvedValue({ count: 1 });
    const res = await DELETE(req, { params });
    expect(res.status).toBe(200);
    expect(prisma.reply.deleteMany).toHaveBeenCalledWith({
      where: { id: "reply_1", eventId: "event_1" },
    });
  });

  it("returns 404 for replies on other events or events of other users", async () => {
    prisma.reply.deleteMany.mockResolvedValueOnce({ count: 0 });
    expect((await DELETE(req, { params })).status).toBe(404);
    prisma.event.findFirst.mockResolvedValueOnce(null);
    expect((await DELETE(req, { params })).status).toBe(404);
    expect(prisma.reply.deleteMany).toHaveBeenCalledTimes(1);
  });
});
