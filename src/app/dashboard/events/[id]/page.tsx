import { redirect } from "next/navigation";

/** The event dashboard arrives in the next phase; open the builder for now. */
export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/events/${id}/edit`);
}
