import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLink } from "@/components/dashboard/CopyLink";
import { DuplicateButton } from "@/components/dashboard/DuplicateButton";
import { ShareQr } from "@/components/dashboard/ShareQr";
import { QuestionBreakdown } from "@/components/dashboard/QuestionBreakdown";
import { RepliesTable } from "@/components/dashboard/RepliesTable";
import { APP_NAME } from "@/config/app";
import { requireUserPage } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatShortDate, isPastDeadline } from "@/lib/events/format";
import { getOwnedEvent } from "@/lib/events/owner";
import { answersOf, computeStats } from "@/lib/events/stats";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: `Event dashboard · ${APP_NAME}` };

function Stat({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="app-card p-5">
      <p className="text-sm text-stone-600">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-stone-500">{note}</p>}
    </div>
  );
}

export default async function EventDashboardPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUserPage(`/dashboard/events/${id}`);
  const event = await getOwnedEvent(user.id, id);
  if (!event) notFound();

  const replies = await prisma.reply.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
  });
  const stats = computeStats(event.content, replies);
  const { deadline } = event.content.rsvp;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        ← Your events
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {event.title}
            </h1>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                event.published
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              {event.published ? "Live" : "Draft"}
            </span>
          </div>
          {deadline && (
            <p className="mt-1 text-sm text-stone-600">
              {isPastDeadline(deadline)
                ? "Replies closed on "
                : "Replies close after "}
              {formatShortDate(deadline)}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <DuplicateButton eventId={event.id} />
          <a
            href={`/api/events/${event.id}/export`}
            className="app-button-secondary"
          >
            Export CSV
          </a>
          <a
            href={`/e/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="app-button-secondary"
          >
            View page
          </a>
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className="app-button"
          >
            Edit page
          </Link>
        </div>
      </div>

      <section className="app-card mt-6 p-5" aria-label="Share">
        {event.published ? (
          <>
            <p className="mb-3 text-sm font-medium">
              Share this link with your guests
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <div className="min-w-0 flex-1">
                <CopyLink path={`/e/${event.slug}`} />
                <p className="mt-3 text-xs text-stone-500">
                  Print the QR code on invitations so guests can reply from
                  their phone.
                </p>
              </div>
              <ShareQr path={`/e/${event.slug}`} slug={event.slug} />
            </div>
          </>
        ) : (
          <p className="text-sm text-stone-600">
            This event is a draft, so guests cannot see it yet.{" "}
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="font-medium text-stone-900 underline"
            >
              Publish it in the builder
            </Link>{" "}
            to get a link to share.
          </p>
        )}
      </section>

      <section
        aria-label="Totals"
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Stat label="Replies" value={stats.replies} />
        <Stat
          label="Coming"
          value={stats.attending}
          note={`${stats.attending === 1 ? "reply" : "replies"} saying yes`}
        />
        <Stat
          label="Headcount"
          value={stats.headcount}
          note="people coming in total"
        />
        <Stat label="Not coming" value={stats.declined} />
      </section>

      {stats.questions.length > 0 && (
        <section className="mt-10" aria-labelledby="answers-heading">
          <h2 id="answers-heading" className="text-lg font-semibold">
            Answers
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.questions.map((q) => (
              <QuestionBreakdown key={q.id} stats={q} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="replies-heading">
        <h2 id="replies-heading" className="text-lg font-semibold">
          Replies
        </h2>
        <div className="mt-4">
          <RepliesTable
            eventId={event.id}
            questions={event.content.rsvp.questions}
            replies={replies.map((r) => ({
              id: r.id,
              name: r.name,
              email: r.email,
              attending: r.attending,
              guestCount: r.guestCount,
              message: r.message,
              answers: answersOf(r),
              createdAt: r.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>
    </main>
  );
}
