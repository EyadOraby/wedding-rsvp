import { z } from "zod";

const email = z
  .string({ error: "Please enter your email" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Please enter a valid email address").max(200));

export const signupSchema = z.object({
  name: z
    .string({ error: "Please enter your name" })
    .trim()
    .min(1, "Please enter your name")
    .max(100, "Name must be 100 characters or fewer"),
  email,
  password: z
    .string({ error: "Please choose a password" })
    .min(8, "Use at least 8 characters")
    .max(200, "Use 200 characters or fewer"),
  /** Hidden honeypot field; people leave it empty. */
  website: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  email,
  password: z
    .string({ error: "Please enter your password" })
    .min(1, "Please enter your password")
    .max(200),
});

/** Only same-site paths are allowed after login, never another origin. */
export function safeNextPath(next: string | null | undefined): string {
  return next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\")
    ? next
    : "/dashboard";
}
