"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Answers } from "@/lib/events/answers";
import type { Question } from "@/lib/events/content";
import { answerText } from "@/lib/events/stats";

export type ReplyRow = {
  id: string;
  name: string;
  email: string | null;
  attending: boolean;
  guestCount: number;
  message: string | null;
  answers: Answers;
  createdAt: string;
};

type Filter = "all" | "coming" | "notComing";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "coming", label: "Coming" },
  { value: "notComing", label: "Not coming" },
];

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function RepliesTable({
  eventId,
  questions,
  replies,
}: {
  eventId: string;
  questions: Question[];
  replies: ReplyRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return replies.filter(
      (r) =>
        (filter === "all" || r.attending === (filter === "coming")) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q)),
    );
  }, [replies, query, filter]);

  async function remove(reply: ReplyRow) {
    if (!window.confirm(`Delete the reply from ${reply.name}?`)) return;
    setDeleting(reply.id);
    const res = await fetch(`/api/events/${eventId}/replies/${reply.id}`, {
      method: "DELETE",
    });
    setDeleting(null);
    if (res.ok) router.refresh();
    else window.alert("Could not delete the reply. Please try again.");
  }

  return (
    <div className="app-card">
      <div className="flex flex-wrap items-center gap-3 border-b border-stone-200 p-4">
        <input
          type="search"
          aria-label="Search replies"
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="app-input max-w-xs"
        />
        <div
          role="group"
          aria-label="Filter replies"
          className="flex rounded-lg border border-stone-300 p-0.5 text-sm"
        >
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={`rounded-md px-3 py-1 ${
                filter === f.value
                  ? "bg-stone-900 text-white"
                  : "text-stone-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-sm text-stone-500">
          {visible.length} of {replies.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="p-8 text-center text-sm text-stone-500">
          {replies.length === 0
            ? "No replies yet. Share your link to start collecting them."
            : "No replies match."}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-2 font-medium">Guest</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Party</th>
                <th className="px-4 py-2 font-medium">Answers</th>
                <th className="px-4 py-2 font-medium">Replied</th>
                <th className="px-4 py-2">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {visible.map((reply) => {
                const answered = questions
                  .map((q) => ({ q, text: answerText(q, reply.answers) }))
                  .filter((a) => a.text);
                return (
                  <tr key={reply.id} className="align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium">{reply.name}</p>
                      {reply.email && (
                        <p className="text-stone-500">{reply.email}</p>
                      )}
                      {reply.message && (
                        <p className="mt-1 max-w-xs italic text-stone-600">
                          “{reply.message}”
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          reply.attending
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {reply.attending ? "Coming" : "Not coming"}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {reply.attending ? reply.guestCount : "–"}
                    </td>
                    <td className="px-4 py-3">
                      {answered.length === 0 ? (
                        <span className="text-stone-400">–</span>
                      ) : (
                        <dl className="space-y-1">
                          {answered.map(({ q, text }) => (
                            <div key={q.id}>
                              <dt className="inline text-stone-500">
                                {q.label}:{" "}
                              </dt>
                              <dd className="inline">{text}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-500">
                      {dateFormat.format(new Date(reply.createdAt))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => remove(reply)}
                        disabled={deleting === reply.id}
                        aria-label={`Delete reply from ${reply.name}`}
                        className="text-stone-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
