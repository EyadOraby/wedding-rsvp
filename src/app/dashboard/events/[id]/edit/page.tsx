import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventBuilder } from "@/components/builder/EventBuilder";
import { APP_NAME } from "@/config/app";
import { requireUserPage } from "@/lib/auth";
import { getOwnedEvent } from "@/lib/events/owner";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: `Edit event · ${APP_NAME}` };

export default async function EditEventPage({ params }: Params) {
  const { id } = await params;
  const user = await requireUserPage(`/dashboard/events/${id}/edit`);
  const event = await getOwnedEvent(user.id, id);
  if (!event) notFound();

  return (
    <EventBuilder
      id={event.id}
      initial={{
        title: event.title,
        slug: event.slug,
        published: event.published,
        content: event.content,
      }}
    />
  );
}
