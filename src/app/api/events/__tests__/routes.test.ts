import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildFromTemplate } from "@/lib/events/templates";

const prisma = vi.hoisted(() => ({
  event: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));
const auth = vi.hoisted(() => ({ requireUserApi: vi.fn() }));
vi.mock("@/lib/db", () => ({ prisma }));
vi.mock("@/lib/auth", () => auth);

import { DELETE, PATCH } from "../[id]/route";
import { POST } from "../route";

const wedding = buildFromTemplate("wedding");
const owned = { id: "event_1", ...wedding, slug: "alex-sam-1234" };
const context = { params: Promise.resolve({ id: "event_1" }) };

function request(method: string, body?: unknown) {
  return new Request("http://localhost/api/events", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const save = (overrides: Record<string, unknown> = {}) =>
  PATCH(
    request("PATCH", {
      title: "Alex & Sam",
      slug: "alex-and-sam",
      published: true,
      content: wedding.content,
      ...overrides,
    }),
    context,
  );

beforeEach(() => {
  vi.clearAllMocks();
  auth.requireUserApi.mockResolvedValue({ userId: "user_1" });
  prisma.event.findFirst.mockResolvedValue(owned);
});

describe("POST /api/events", () => {
  it("creates a draft from the template for the signed-in user", async () => {
    prisma.event.create.mockResolvedValue({ id: "event_1" });
    const res = await POST(request("POST", { type: "wedding" }));
    expect(res.status).toBe(201);
    const data = prisma.event.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      ownerId: "user_1",
      type: "wedding",
      title: "Alex & Sam",
      content: wedding.content,
    });
    expect(data.slug).toMatch(/^alex-sam-[a-z0-9]{4}$/);
  });

  it("tries another address when the first is taken", async () => {
    prisma.event.create
      .mockRejectedValueOnce({ code: "P2002" })
      .mockResolvedValueOnce({ id: "event_2" });
    const res = await POST(request("POST", { type: "party" }));
    expect(res.status).toBe(201);
    expect(prisma.event.create).toHaveBeenCalledTimes(2);
  });

  it("rejects unknown templates and signed-out users", async () => {
    expect((await POST(request("POST", { type: "funeral" }))).status).toBe(400);
    auth.requireUserApi.mockResolvedValueOnce({
      response: NextResponse.json({}, { status: 401 }),
    });
    expect((await POST(request("POST", { type: "wedding" }))).status).toBe(401);
  });
});

describe("PATCH /api/events/[id]", () => {
  it("saves valid builder state", async () => {
    prisma.event.update.mockResolvedValue({ slug: "alex-and-sam" });
    const res = await save();
    expect(res.status).toBe(200);
    expect(prisma.event.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "event_1" },
        data: expect.objectContaining({
          slug: "alex-and-sam",
          published: true,
        }),
      }),
    );
  });

  it("returns 404 for events the user does not own", async () => {
    prisma.event.findFirst.mockResolvedValueOnce(null);
    expect((await save()).status).toBe(404);
    expect(prisma.event.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "event_1", ownerId: "user_1" } }),
    );
    expect(prisma.event.update).not.toHaveBeenCalled();
  });

  it("rejects invalid content and slugs", async () => {
    expect((await save({ slug: "Not OK" })).status).toBe(400);
    const broken = structuredClone(wedding.content);
    broken.sections = [];
    expect((await save({ content: broken })).status).toBe(400);
    expect(prisma.event.update).not.toHaveBeenCalled();
  });

  it("reports a taken address", async () => {
    prisma.event.update.mockRejectedValueOnce({ code: "P2002" });
    const res = await save();
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ field: "slug" });
  });
});

describe("DELETE /api/events/[id]", () => {
  it("deletes only the user's own event", async () => {
    expect((await DELETE(request("DELETE"), context)).status).toBe(200);
    expect(prisma.event.delete).toHaveBeenCalledWith({
      where: { id: "event_1" },
    });
    prisma.event.findFirst.mockResolvedValueOnce(null);
    expect((await DELETE(request("DELETE"), context)).status).toBe(404);
  });
});
