import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/config/app";
import { requireUserPage } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { eventContentSchema, type EventType } from "@/lib/events/content";
import { formatShortDate } from "@/lib/events/format";
import { TEMPLATES } from "@/lib/events/templates";
import { THEMES, titleFont } from "@/lib/events/themes";

export const metadata: Metadata = { title: `Your events · ${APP_NAME}` };

export default async function DashboardPage() {
  const user = await requireUserPage();
  const [events, headcounts] = await Promise.all([
    prisma.event.findMany({
      where: { ownerId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        type: true,
        published: true,
        content: true,
        _count: { select: { replies: true } },
      },
    }),
    prisma.reply.groupBy({
      by: ["eventId"],
      where: { event: { ownerId: user.id }, attending: true },
      _sum: { guestCount: true },
    }),
  ]);
  const headcount = new Map(
    headcounts.map((h) => [h.eventId, h._sum.guestCount ?? 0]),
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your events</h1>
          <p className="text-sm text-stone-600">
            Hi {user.name.split(" ")[0]}, here is everything you are hosting.
          </p>
        </div>
        <Link href="/dashboard/new" className="app-button">
          New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="app-card mt-8 p-10 text-center">
          <p className="font-medium">No events yet</p>
          <p className="mt-1 text-sm text-stone-600">
            Pick a template, make it yours and share the link.
          </p>
          <Link href="/dashboard/new" className="app-button mt-6">
            Create your first event
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            // A card should still render if one event's content is broken.
            const parsed = eventContentSchema.safeParse(event.content);
            const content = parsed.success ? parsed.data : null;
            const theme = THEMES[content?.theme.id ?? "classic"];
            const accent = content?.theme.accent || theme.colors.accent;
            const date = content ? formatShortDate(content.details.date) : "";
            return (
              <li key={event.id}>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="app-card block overflow-hidden transition-shadow hover:shadow-md"
                >
                  <div
                    className="flex h-24 items-center justify-center px-4"
                    style={{
                      background: theme.colors.background,
                      color: theme.colors.text,
                      borderBottom: `3px solid ${accent}`,
                    }}
                  >
                    <span
                      className="truncate text-2xl"
                      style={{
                        fontFamily: titleFont(theme),
                        textTransform: theme.upperTitle
                          ? "uppercase"
                          : undefined,
                      }}
                    >
                      {event.title}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-stone-500">
                        {TEMPLATES[event.type as EventType]?.label ?? "Event"}
                        {date && ` · ${date}`}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-medium ${
                          event.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {event.published ? "Live" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-2 truncate font-semibold">{event.title}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {event._count.replies}{" "}
                      {event._count.replies === 1 ? "reply" : "replies"} ·{" "}
                      {headcount.get(event.id) ?? 0} coming
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
