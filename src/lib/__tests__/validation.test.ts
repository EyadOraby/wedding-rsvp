import { describe, expect, it } from "vitest";
import { rsvpSchema, settingsSchema } from "../validation";

const attending = {
  guestName: "  Sara Ahmed ",
  email: "",
  attending: true,
  guestCount: 2,
  mealOptionId: "meal_1",
  dietaryLabels: ["Vegetarian"],
  dietaryOther: "",
  message: "",
};

describe("rsvpSchema", () => {
  it("trims text and turns empty optional fields into null", () => {
    const result = rsvpSchema.parse(attending);
    expect(result.guestName).toBe("Sara Ahmed");
    expect(result.email).toBeNull();
    expect(result.dietaryOther).toBeNull();
    expect(result.message).toBeNull();
  });

  it("requires a meal when attending", () => {
    const result = rsvpSchema.safeParse({ ...attending, mealOptionId: null });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Please choose a meal option");
  });

  it("does not require a meal when declining", () => {
    const result = rsvpSchema.safeParse({
      guestName: "Omar",
      attending: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing attendance answer", () => {
    const result = rsvpSchema.safeParse({ guestName: "Omar" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Please let us know if you can attend",
    );
  });

  it.each([0, 11, 1.5])("rejects a guest count of %s", (guestCount) => {
    expect(rsvpSchema.safeParse({ ...attending, guestCount }).success).toBe(
      false,
    );
  });

  it("rejects an invalid email and an over-long name", () => {
    expect(
      rsvpSchema.safeParse({ ...attending, email: "not-an-email" }).success,
    ).toBe(false);
    expect(
      rsvpSchema.safeParse({ ...attending, guestName: "x".repeat(101) })
        .success,
    ).toBe(false);
  });
});

describe("settingsSchema", () => {
  const settings = {
    initials: "J & Y",
    coupleNames: "Jordan & Yossef",
    weddingDate: "November 21, 2026",
    location: "Cairo, Egypt",
    rsvpHeading: "RSVP",
    bankingHeading: "Gifting",
  };

  it("accepts an https hero image or none", () => {
    expect(settingsSchema.parse(settings).heroImageUrl).toBeNull();
    expect(
      settingsSchema.parse({
        ...settings,
        heroImageUrl: "https://example.com/hero.jpg",
      }).heroImageUrl,
    ).toBe("https://example.com/hero.jpg");
  });

  it("rejects non-https hero image URLs", () => {
    for (const heroImageUrl of [
      "http://example.com/a.jpg",
      "javascript:alert(1)",
    ]) {
      expect(
        settingsSchema.safeParse({ ...settings, heroImageUrl }).success,
      ).toBe(false);
    }
  });
});
