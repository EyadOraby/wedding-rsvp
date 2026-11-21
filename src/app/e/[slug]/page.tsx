import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventPageView } from "@/components/event/EventPageView";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { answersOf } from "@/lib/events/stats";
import { isToken } from "@/lib/events/tokens";
import { formatEventDate, isPastDeadline } from "@/lib/events/format";
import { getEventBySlug } from "@/lib/events/queries";

type Params = { params: Promise<{ slug: string }> };

/** Published events are public; drafts are visible to their owner only. */
async function loadVisibleEvent(slug: string) {
  const event = await getEventBySlug(slug);
  if (!event) return null;
  if (event.published) return { event, isDraft: false };
  const userId = await getSessionUserId();
  return userId === event.ownerId ? { event, isDraft: true } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await loadVisibleEvent((await params).slug);
  if (!found) return { title: "Event not found" };
  const { title, content } = found.event;
  const date = formatEventDate(content.details.date);
  return {
    title: `${title}${date ? ` · ${date}` : ""}`,
    description: content.details.intro || `You're invited: ${title}`,
    openGraph: {
      title,
      description: content.details.intro || `You're invited: ${title}`,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    robots: { index: false, follow: false },
  };
}

/** Form settings for a personal invitation link (?i=token). */
async function inviteForm(eventId: string, token: string | undefined) {
  if (!token || !isToken(token)) return undefined;
  const invite = await prisma.invite.findFirst({
    where: { eventId, token },
    include: { replies: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!invite) return undefined;
  const reply = invite.replies[0];
  const base = { invite: { token, maxGuests: invite.maxGuests } };
  // Once this guest has replied, their link opens the reply for editing.
  if (reply?.editToken) {
    return {
      ...base,
      editToken: reply.editToken,
      initial: {
        name: reply.name,
        email: reply.email ?? "",
        message: reply.message ?? "",
        attending: reply.attending,
        guestCount: Math.max(reply.guestCount, 1),
        answers: answersOf(reply),
      },
    };
  }
  return {
    ...base,
    initial: {
      name: invite.name,
      email: invite.email ?? "",
      message: "",
      attending: null,
      guestCount: 1,
      answers: {},
    },
  };
}

export default async function EventPage({
  params,
  searchParams,
}: Params & { searchParams: Promise<{ i?: string }> }) {
  const found = await loadVisibleEvent((await params).slug);
  if (!found) notFound();
  const { event, isDraft } = found;
  const form = await inviteForm(event.id, (await searchParams).i);

  return (
    <EventPageView
      title={event.title}
      content={event.content}
      slug={event.slug}
      closed={isPastDeadline(event.content.rsvp.deadline)}
      form={form}
      notice={
        isDraft && (
          <div className="bg-amber-100 px-4 py-2 text-center font-sans text-sm text-amber-900">
            Draft: only you can see this page.{" "}
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="font-medium underline"
            >
              Publish it in the builder
            </Link>
          </div>
        )
      }
    />
  );
}
