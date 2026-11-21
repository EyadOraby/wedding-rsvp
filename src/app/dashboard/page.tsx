import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/config/app";
import { requireUserPage } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { EventType } from "@/lib/events/content";
import { TEMPLATES } from "@/lib/events/templates";

export const metadata: Metadata = { title: `Your events · ${APP_NAME}` };

export default async function DashboardPage() {
  const user = await requireUserPage();
  const events = await prisma.event.findMany({
    where: { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      type: true,
      published: true,
      _count: { select: { replies: true } },
    },
  });

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
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/dashboard/events/${event.id}`}
                className="app-card block p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-stone-500">
                    {TEMPLATES[event.type as EventType]?.label ?? "Event"}
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
                <p className="mt-3 truncate text-lg font-semibold">
                  {event.title}
                </p>
                <p className="mt-1 text-sm text-stone-600">
                  {event._count.replies}{" "}
                  {event._count.replies === 1 ? "reply" : "replies"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
