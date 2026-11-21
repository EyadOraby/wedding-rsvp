import { brandImage, OG_SIZE } from "@/lib/og";

export const alt = "RSVP Studio: beautiful RSVP pages for any event";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return brandImage();
}
