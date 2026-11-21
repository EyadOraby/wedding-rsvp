"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EVENT_TYPES, type EventType } from "@/lib/events/content";
import { TEMPLATES } from "@/lib/events/templates";
import { THEMES } from "@/lib/events/themes";

export function TemplatePicker() {
  const router = useRouter();
  const [pending, setPending] = useState<EventType | null>(null);
  const [error, setError] = useState("");

  async function create(type: EventType) {
    setPending(type);
    setError("");
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not create the event");
      router.push(`/dashboard/events/${data.id}/edit`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create the event",
      );
      setPending(null);
    }
  }

  return (
    <div>
      {error && (
        <p role="alert" className="app-error mb-4">
          {error}
        </p>
      )}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EVENT_TYPES.map((type) => {
          const template = TEMPLATES[type];
          const theme = THEMES[template.content.theme.id];
          return (
            <li key={type}>
              <button
                type="button"
                onClick={() => create(type)}
                disabled={pending !== null}
                className="app-card block w-full overflow-hidden text-left transition-shadow hover:shadow-md disabled:opacity-60"
              >
                <div
                  className="flex h-28 flex-col items-center justify-center"
                  style={{
                    background: theme.colors.background,
                    color: theme.colors.text,
                  }}
                >
                  <span className="text-[10px] uppercase tracking-[0.3em] opacity-70">
                    {template.content.details.headline}
                  </span>
                  <span
                    className="mt-1 text-2xl"
                    style={{
                      fontFamily: theme.scriptTitle
                        ? "var(--font-great-vibes)"
                        : "var(--font-inter)",
                    }}
                  >
                    {template.title}
                  </span>
                </div>
                <div className="p-4">
                  <p className="font-semibold">
                    {template.label}
                    {pending === type && (
                      <span className="ml-2 text-sm font-normal text-stone-500">
                        Creating…
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {template.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
