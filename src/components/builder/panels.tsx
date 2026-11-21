"use client";

import { useState } from "react";
import type { EventContent } from "@/lib/events/content";
import type { Update } from "./SectionsPanel";
import { Field, TextField } from "./ui";

export function DetailsPanel({
  title,
  setTitle,
  content,
  update,
}: {
  title: string;
  setTitle: (value: string) => void;
  content: EventContent;
  update: Update;
}) {
  const { details } = content;
  const set = (key: keyof EventContent["details"]) => (value: string) =>
    update((d) => {
      d.details[key] = value;
    });
  return (
    <div className="space-y-4">
      <TextField
        label="Event name"
        hint="The big title on the page, e.g. the couple's names."
        value={title}
        maxLength={120}
        onChange={setTitle}
      />
      <TextField
        label="Line above the name"
        placeholder="The wedding of"
        value={details.headline}
        maxLength={80}
        onChange={set("headline")}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Date"
          type="date"
          value={details.date}
          onChange={set("date")}
        />
        <TextField
          label="Start time"
          type="time"
          value={details.time}
          onChange={set("time")}
        />
      </div>
      <TextField
        label="Venue"
        value={details.venue}
        maxLength={120}
        onChange={set("venue")}
      />
      <TextField
        label="Address"
        multiline
        value={details.address}
        maxLength={200}
        onChange={set("address")}
      />
      <TextField
        label="Map link (optional)"
        type="url"
        placeholder="https://maps.google.com/…"
        hint="Without one, guests get a map search for the address."
        value={details.mapUrl}
        onChange={set("mapUrl")}
      />
      <TextField
        label="Welcome text"
        multiline
        value={details.intro}
        maxLength={500}
        onChange={set("intro")}
      />
    </div>
  );
}

export function PublishPanel({
  slug,
  setSlug,
  published,
  origin,
  onTogglePublish,
  onDelete,
  busy,
}: {
  slug: string;
  setSlug: (value: string) => void;
  published: boolean;
  origin: string;
  onTogglePublish: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const url = `${origin}/e/${slug}`;
  return (
    <div className="space-y-6">
      <Field
        label="Page address"
        hint="Lowercase letters, numbers and dashes. Changing it breaks links you already shared."
      >
        {(id) => (
          <div className="flex items-center rounded-lg border border-stone-300 bg-white focus-within:border-stone-900 focus-within:ring-1 focus-within:ring-stone-900">
            <span className="pl-3 text-sm text-stone-500">/e/</span>
            <input
              id={id}
              value={slug}
              maxLength={60}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              className="w-full bg-transparent px-1 py-2 text-sm outline-none"
            />
          </div>
        )}
      </Field>

      <div className="app-card space-y-3 p-4">
        <p className="text-sm">
          {published
            ? "Your page is live. Anyone with the link can see it and reply."
            : "Your page is a draft. Only you can see it until you publish."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTogglePublish}
            disabled={busy}
            className="app-button"
          >
            {published ? "Unpublish" : "Publish"}
          </button>
          {published && (
            <button
              type="button"
              className="app-button-secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          )}
        </div>
        {published && <p className="break-all text-xs text-stone-500">{url}</p>}
      </div>

      <div className="rounded-xl border border-red-200 p-4">
        <p className="text-sm font-medium text-red-700">Delete event</p>
        <p className="mt-1 text-sm text-stone-600">
          Removes the page and every reply. This cannot be undone.
        </p>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="mt-3 rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
        >
          Delete this event
        </button>
      </div>
    </div>
  );
}
