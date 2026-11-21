/** True when the hidden "website" field, which people never see, was filled in. */
export function isHoneypotFilled(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    "website" in body &&
    typeof body.website === "string" &&
    body.website.trim() !== ""
  );
}
