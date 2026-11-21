import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventRsvpForm } from "@/components/event/EventRsvpForm";
import { prisma } from "@/lib/db";
import { isPastDeadline } from "@/lib/events/format";
import { getEventBySlug } from "@/lib/events/queries";
import { answersOf } from "@/lib/events/stats";
import { themeVariables } from "@/lib/events/themes";
import { isToken } from "@/lib/events/tokens";

type Params = { params: Promise<{ slug: string; token: string }> };

export const metadata: Metadata = {
  title: "Change your reply",
  robots: { index: false, follow: false },
};

/** A guest's private page to change the reply they already sent. */
export default async function EditReplyPage({ params }: Params) {
  const { slug, token } = await params;
  const event = await getEventBySlug(slug);
  const reply =
    event?.published && isToken(token)
      ? await prisma.reply.findFirst({
          where: { editToken: token, eventId: event.id },
        })
      : null;
  if (!event || !reply) notFound();

  return (
    <div
      className="ev min-h-screen px-6 py-14"
      style={themeVariables(event.content.theme) as CSSProperties}
    >
      <div className="mx-auto max-w-2xl">
        <p className="ev-kicker text-center">Your reply to</p>
        <h1 className="ev-title mt-3 text-center text-5xl">{event.title}</h1>
        <p className="ev-muted mt-4 text-center text-sm">
          Change anything below and send it again.{" "}
          <Link href={`/e/${slug}`} className="ev-link">
            Back to the invitation
          </Link>
        </p>
        <div className="mt-12">
          <EventRsvpForm
            title={event.title}
            content={event.content}
            slug={slug}
            closed={isPastDeadline(event.content.rsvp.deadline)}
            editToken={token}
            initial={{
              name: reply.name,
              email: reply.email ?? "",
              message: reply.message ?? "",
              attending: reply.attending,
              guestCount: Math.max(reply.guestCount, 1),
              answers: answersOf(reply),
            }}
          />
        </div>
      </div>
    </div>
  );
}
