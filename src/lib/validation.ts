import { NextResponse } from "next/server";
import { z } from "zod";

/** Trimmed optional text; empty strings become null. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Must be ${max} characters or fewer`)
    .nullish()
    .transform((value) => value || null);

export const rsvpSchema = z
  .object({
    guestName: z
      .string({ error: "Please enter your name" })
      .trim()
      .min(1, "Please enter your name")
      .max(100, "Name must be 100 characters or fewer"),
    email: z
      .union([z.literal(""), z.email("Please enter a valid email address")])
      .nullish()
      .transform((value) => value || null),
    attending: z.boolean({ error: "Please let us know if you can attend" }),
    guestCount: z
      .number()
      .int()
      .min(1, "At least 1 guest")
      .max(10, "At most 10 guests")
      .default(1),
    mealOptionId: z.string().max(64).nullish(),
    dietaryLabels: z
      .array(z.string().trim().min(1).max(60))
      .max(20)
      .default([]),
    dietaryOther: optionalText(200),
    message: optionalText(1000),
  })
  .superRefine((data, ctx) => {
    if (data.attending && !data.mealOptionId) {
      ctx.addIssue({
        code: "custom",
        path: ["mealOptionId"],
        message: "Please choose a meal option",
      });
    }
  });

export type RsvpInput = z.infer<typeof rsvpSchema>;

export const mealCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).default(""),
  tag: optionalText(20),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const mealUpdateSchema = mealCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const dietaryCreateSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(60),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const dietaryUpdateSchema = dietaryCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const bankingSchema = z.object({
  accountName: z.string().trim().max(120).default(""),
  bankName: z.string().trim().max(120).default(""),
  accountNumber: z.string().trim().max(64).default(""),
  branchCode: z.string().trim().max(64).default(""),
  notes: optionalText(500),
  active: z.boolean().default(true),
});

export const settingsSchema = z.object({
  initials: z.string().trim().min(1).max(20),
  coupleNames: z.string().trim().min(1).max(120),
  weddingDate: z.string().trim().min(1).max(60),
  location: z.string().trim().min(1).max(120),
  heroImageUrl: z
    .union([z.literal(""), z.url({ protocol: /^https$/ })])
    .nullish()
    .transform((value) => value || null),
  rsvpHeading: z.string().trim().min(1).max(60),
  bankingHeading: z.string().trim().min(1).max(60),
});

type Parsed<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Reads a JSON body and validates it, returning a 400 response on failure. */
export async function parseJson<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<Parsed<z.infer<T>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    const issue = result.error.issues[0];
    return {
      ok: false,
      response: NextResponse.json(
        { error: issue?.message ?? "Invalid request", field: issue?.path[0] },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: result.data };
}
