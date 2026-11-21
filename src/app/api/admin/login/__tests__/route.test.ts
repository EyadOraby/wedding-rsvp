import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimits } from "@/lib/rate-limit";
import { POST } from "../route";

function login(password: string, ip = "198.51.100.1") {
  return POST(
    new Request("http://localhost/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
      body: JSON.stringify({ password }),
    }),
  );
}

describe("POST /api/admin/login", () => {
  beforeEach(() => {
    resetRateLimits();
    vi.stubEnv("ADMIN_PASSWORD", "correct horse");
  });

  it("rejects a wrong password", async () => {
    const res = await login("wrong");
    expect(res.status).toBe(401);
  });

  it("locks an address out after five failed attempts", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await login("wrong")).status).toBe(401);
    }
    const blocked = await login("correct horse");
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get("Retry-After")).toBeTruthy();

    expect((await login("wrong", "198.51.100.2")).status).toBe(401);
  });
});
