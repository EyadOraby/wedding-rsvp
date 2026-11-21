/** Turns any title into a URL-safe slug: "Café & Co!" -> "cafe-co". */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50)
    .replace(/-+$/g, "");
}

/** A readable slug with a short random suffix so it is unlikely to clash. */
export function suggestSlug(title: string, random = Math.random): string {
  const base = slugify(title) || "event";
  const suffix = random().toString(36).slice(2, 6).padEnd(4, "0");
  return `${base}-${suffix}`;
}
