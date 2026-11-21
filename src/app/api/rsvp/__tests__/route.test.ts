import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  mealOption: { findFirst: vi.fn() },
  rsvp: { create: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma }));

import { POST } from "../route";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("POST /api/rsvp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.rsvp.create.mockResolvedValue({ id: "rsvp_1" });
  });

  it("saves an attending guest with an active meal", async () => {
    prisma.mealOption.findFirst.mockResolvedValue({ id: "meal_1" });
    const res = await post({
      guestName: "Sara",
      attending: true,
      guestCount: 2,
      mealOptionId: "meal_1",
    });

    expect(res.status).toBe(200);
    expect(prisma.rsvp.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        guestName: "Sara",
        guestCount: 2,
        mealOptionId: "meal_1",
      }),
    });
  });

  it("rejects an inactive or unknown meal", async () => {
    prisma.mealOption.findFirst.mockResolvedValue(null);
    const res = await post({
      guestName: "Sara",
      attending: true,
      mealOptionId: "hidden_meal",
    });

    expect(res.status).toBe(400);
    expect(prisma.rsvp.create).not.toHaveBeenCalled();
  });

  it("stores a declining guest with zero guests and no meal", async () => {
    const res = await post({
      guestName: "Omar",
      attending: false,
      mealOptionId: "meal_1",
      dietaryLabels: ["Vegan"],
    });

    expect(res.status).toBe(200);
    expect(prisma.mealOption.findFirst).not.toHaveBeenCalled();
    expect(prisma.rsvp.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        guestCount: 0,
        mealOptionId: null,
        dietaryLabels: [],
      }),
    });
  });

  it("returns 400 for malformed input instead of crashing", async () => {
    const res = await post({ guestName: 42, attending: "yes" });
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await POST(
      new Request("http://localhost/api/rsvp", { method: "POST", body: "{" }),
    );
    expect(res.status).toBe(400);
  });
});
