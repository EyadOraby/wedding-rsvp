"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Copies the event into a new draft and opens it in the builder. */
export function DuplicateButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function duplicate() {
    setPending(true);
    const res = await fetch(`/api/events/${eventId}/duplicate`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      router.push(`/dashboard/events/${data.id}/edit`);
    } else {
      setPending(false);
      window.alert(data.error || "Could not copy the event.");
    }
  }

  return (
    <button
      type="button"
      onClick={duplicate}
      disabled={pending}
      className="app-button-secondary"
    >
      {pending ? "Copying…" : "Duplicate"}
    </button>
  );
}
