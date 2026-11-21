import { describe, expect, it } from "vitest";
import { qrSvg } from "../qr";

describe("qrSvg", () => {
  it("draws a scalable SVG QR code", () => {
    const svg = qrSvg("https://example.com/e/alex-and-sam");
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("viewBox");
    expect(svg).toContain("<path");
  });

  it("is the same for the same link and different for another", () => {
    const a = qrSvg("https://example.com/e/a");
    expect(qrSvg("https://example.com/e/a")).toBe(a);
    expect(qrSvg("https://example.com/e/b")).not.toBe(a);
  });
});
