import { getEventBySlug } from "@/lib/events/queries";
import { brandImage, eventImage, OG_SIZE } from "@/lib/og";

export const alt = "Event invitation";
export const size = OG_SIZE;
export const contentType = "image/png";

/** Link preview for chat apps. Drafts get the generic card, so nothing leaks. */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const event = await getEventBySlug((await params).slug);
  return event?.published
    ? eventImage(event.title, event.content)
    : brandImage();
}
