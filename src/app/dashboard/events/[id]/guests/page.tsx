import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GuestList, type GuestRow } from "@/components/dashboard/GuestList";
import { APP_NAME } from "@/config/app";
import { requireUserPage } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getOwnedEvent } from "@/lib/events/owner";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: `Guest list · ${APP_NAME}` };

export default async function GuestListPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUserPage(`/dashboard/events/${id}/guests`);
  const event = await getOwnedEvent(user.id, id);
  if (!event) notFound();

  const invites = await prisma.invite.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "asc" },
    include: {
      replies: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { attending: true, guestCount: true },
      },
    },
  });
  const guests: GuestRow[] = invites.map((invite) => {
    const reply = invite.replies[0];
    return {
      id: invite.id,
      name: invite.name,
      email: invite.email,
      maxGuests: invite.maxGuests,
      token: invite.token,
      status: !reply ? "pending" : reply.attending ? "coming" : "notComing",
      partySize: reply?.guestCount ?? 0,
    };
  });
  const replied = guests.filter((g) => g.status !== "pending").length;
  const rate = guests.length ? Math.round((replied / guests.length) * 100) : 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href={`/dashboard/events/${event.id}`}
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        ← {event.title}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Guest list</h1>
      <p className="mt-1 text-sm text-stone-600">
        Send each guest their personal link. Their name is filled in, and once
        they reply the same link lets them change it.
      </p>

      {guests.length > 0 && (
        <section
          aria-label="Response rate"
          className="mt-6 grid gap-4 sm:grid-cols-3"
        >
          {[
            ["Invited", guests.length],
            ["Replied", replied],
            ["Response rate", `${rate}%`],
          ].map(([label, value]) => (
            <div key={label} className="app-card p-5">
              <p className="text-sm text-stone-600">{label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {value}
              </p>
            </div>
          ))}
        </section>
      )}

      <div className="mt-6">
        <GuestList
          eventId={event.id}
          slug={event.slug}
          published={event.published}
          guests={guests}
        />
      </div>
    </main>
  );
}
