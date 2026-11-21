import { beforeEach, describe, expect, it } from "vitest";
import { clientIp, rateLimit, resetRateLimits } from "../rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows requests up to the limit, then blocks until the window resets", () => {
    const start = 1_000_000;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("k", 3, 60_000, start).ok).toBe(true);
    }
    const blocked = rateLimit("k", 3, 60_000, start + 1_000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(59);
    expect(rateLimit("k", 3, 60_000, start + 60_000).ok).toBe(true);
  });

  it("tracks keys separately", () => {
    expect(rateLimit("a", 1, 60_000, 0).ok).toBe(true);
    expect(rateLimit("b", 1, 60_000, 0).ok).toBe(true);
    expect(rateLimit("a", 1, 60_000, 1).ok).toBe(false);
  });
});

describe("clientIp", () => {
  it("uses the first x-forwarded-for address", () => {
    const request = new Request("http://localhost", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(clientIp(request)).toBe("203.0.113.7");
  });
});
