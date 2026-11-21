"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { parseGuestLines } from "@/lib/events/invites";

export type GuestRow = {
  id: string;
  name: string;
  email: string | null;
  maxGuests: number | null;
  token: string;
  status: "pending" | "coming" | "notComing";
  partySize: number;
};

const STATUS = {
  pending: { label: "Waiting", className: "bg-amber-50 text-amber-800" },
  coming: { label: "Coming", className: "bg-emerald-50 text-emerald-700" },
  notComing: { label: "Not coming", className: "bg-stone-100 text-stone-600" },
};

export function GuestList({
  eventId,
  slug,
  published,
  guests,
}: {
  eventId: string;
  slug: string;
  published: boolean;
  guests: GuestRow[];
}) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Personal links need the browser's origin.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const linkFor = (guest: GuestRow) => `${origin}/e/${slug}?i=${guest.token}`;

  async function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const invites = parseGuestLines(text);
    if (invites.length === 0) return;
    setPending(true);
    setError("");
    const res = await fetch(`/api/events/${eventId}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invites }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not add the guests");
      return;
    }
    setText("");
    router.refresh();
  }

  async function remove(guest: GuestRow) {
    if (!window.confirm(`Remove ${guest.name} from the guest list?`)) return;
    const res = await fetch(`/api/events/${eventId}/invites/${guest.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  async function copy(guest: GuestRow) {
    await navigator.clipboard.writeText(linkFor(guest));
    setCopied(guest.id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="app-card space-y-3 p-5">
        <label htmlFor="guest-lines" className="app-label">
          Add guests, one per line
        </label>
        <textarea
          id="guest-lines"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            "Sara Ahmed, sara@example.com, 2\nOmar Khaled\nLina Haddad, 1"
          }
          className="app-input font-mono"
        />
        <p className="text-xs text-stone-500">
          A name, then optionally an email and how many people the invitation
          covers. You can paste a column from a spreadsheet.
        </p>
        {error && (
          <p role="alert" className="app-error">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="app-button"
        >
          {pending ? "Adding…" : "Add to guest list"}
        </button>
      </form>

      {!published && guests.length > 0 && (
        <p className="app-error">
          This event is still a draft: personal links only work once it is
          published.
        </p>
      )}

      <div className="app-card overflow-x-auto">
        {guests.length === 0 ? (
          <p className="p-8 text-center text-sm text-stone-500">
            No guests yet. Each guest you add gets a personal link that fills in
            their name and shows you who has not replied.
          </p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">Guest</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Party</th>
                <th className="px-4 py-2 font-medium">Personal link</th>
                <th className="px-4 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{guest.name}</p>
                    {guest.email && (
                      <p className="text-stone-500">{guest.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[guest.status].className}`}
                    >
                      {STATUS[guest.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {guest.status === "coming"
                      ? guest.partySize
                      : guest.maxGuests
                        ? `up to ${guest.maxGuests}`
                        : "–"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => copy(guest)}
                      className="text-sm font-medium text-stone-700 underline"
                    >
                      {copied === guest.id ? "Copied" : "Copy link"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => remove(guest)}
                      aria-label={`Remove ${guest.name}`}
                      className="text-stone-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
