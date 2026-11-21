"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { EventPageView } from "@/components/event/EventPageView";
import {
  eventContentSchema,
  eventTitleSchema,
  slugSchema,
  type EventContent,
} from "@/lib/events/content";
import { DesignPanel, DetailsPanel, PublishPanel } from "./panels";
import { RsvpPanel } from "./RsvpPanel";
import { SectionsPanel, type Update } from "./SectionsPanel";

const TABS = ["Details", "Design", "Sections", "RSVP form", "Publish"] as const;
type Tab = (typeof TABS)[number];

type Props = {
  id: string;
  initial: {
    title: string;
    slug: string;
    published: boolean;
    content: EventContent;
  };
};

type SaveState = "saved" | "dirty" | "saving";

/** Turns a schema issue into a message that says where to look. */
function describeIssue(
  content: EventContent,
  issue: { path: PropertyKey[]; message: string },
): string {
  const [area, index] = issue.path;
  if (area === "sections" && typeof index === "number") {
    return `Sections › ${content.sections[index]?.title || "section"}: ${issue.message}`;
  }
  if (area === "rsvp" && issue.path[1] === "questions") {
    const q = content.rsvp.questions[issue.path[2] as number];
    return `RSVP form › ${q?.label || "question"}: ${issue.message}`;
  }
  if (area === "details") return `Details: ${issue.message}`;
  if (area === "theme") return `Design: ${issue.message}`;
  return issue.message;
}

export function EventBuilder({ id, initial }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("Details");
  const [title, setTitleState] = useState(initial.title);
  const [slug, setSlugState] = useState(initial.slug);
  const [published, setPublished] = useState(initial.published);
  const [content, setContent] = useState(initial.content);
  const [state, setState] = useState<SaveState>("saved");
  const [error, setError] = useState("");
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    // The page address shown to the host needs the browser's origin.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrigin(window.location.origin);
  }, []);

  const touch = () => {
    setState("dirty");
    setError("");
  };
  const update: Update = (change) => {
    setContent((current) => {
      const next = structuredClone(current);
      change(next);
      return next;
    });
    touch();
  };
  const setTitle = (value: string) => {
    setTitleState(value);
    touch();
  };
  const setSlug = (value: string) => {
    setSlugState(value);
    touch();
  };

  const save = useCallback(
    async (nextPublished = published) => {
      const checks = [
        eventTitleSchema.safeParse(title),
        slugSchema.safeParse(slug),
        eventContentSchema.safeParse(content),
      ];
      for (const [i, check] of checks.entries()) {
        if (!check.success) {
          const issue = check.error.issues[0];
          const prefix = ["Details: ", "Publish › Page address: ", ""][i];
          setError(
            i === 2 ? describeIssue(content, issue) : prefix + issue.message,
          );
          if (i === 1) setTab("Publish");
          return false;
        }
      }
      setState("saving");
      setError("");
      try {
        const res = await fetch(`/api/events/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            slug,
            published: nextPublished,
            content,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not save");
        setPublished(data.event.published);
        setSlugState(data.event.slug);
        setState("saved");
        router.refresh();
        return true;
      } catch (err) {
        setState("dirty");
        setError(err instanceof Error ? err.message : "Could not save");
        return false;
      }
    },
    [content, id, published, router, slug, title],
  );

  // Ctrl/Cmd+S saves, and leaving with unsaved changes asks first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (state !== "saved") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [save, state]);

  async function remove() {
    if (
      !window.confirm(
        `Delete "${title}" and all of its replies? This cannot be undone.`,
      )
    ) {
      return;
    }
    setState("saving");
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setState("saved");
      router.replace("/dashboard");
      router.refresh();
    } else {
      setState("dirty");
      setError("Could not delete the event");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3 px-4 py-2">
          <Link
            href={`/dashboard/events/${id}`}
            className="text-sm text-stone-600 hover:text-stone-900"
          >
            ← Back
          </Link>
          <p className="min-w-0 flex-1 truncate font-medium">
            {title || "Untitled event"}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              published
                ? "bg-emerald-50 text-emerald-700"
                : "bg-stone-100 text-stone-600"
            }`}
          >
            {published ? "Live" : "Draft"}
          </span>
          <span
            className="hidden text-xs text-stone-500 sm:inline"
            aria-live="polite"
          >
            {state === "saved"
              ? "All changes saved"
              : state === "saving"
                ? "Saving…"
                : "Unsaved changes"}
          </span>
          <a
            href={`/e/${initial.slug === slug ? slug : initial.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="app-button-secondary"
          >
            View page
          </a>
          <button
            type="button"
            onClick={() => void save()}
            disabled={state !== "dirty"}
            className="app-button"
          >
            Save
          </button>
        </div>
        {error && (
          <p role="alert" className="app-error mx-4 mb-2">
            {error}
          </p>
        )}
      </div>

      <div className="grid flex-1 lg:grid-cols-[26rem_1fr]">
        <aside className="border-b border-stone-200 bg-white lg:border-b-0 lg:border-r">
          <div
            role="tablist"
            aria-label="Builder sections"
            className="flex overflow-x-auto border-b border-stone-200"
          >
            {TABS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={tab === name}
                onClick={() => setTab(name)}
                className={`whitespace-nowrap px-3 py-3 text-sm ${
                  tab === name
                    ? "border-b-2 border-stone-900 font-medium text-stone-900"
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            className="p-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
          >
            {tab === "Details" && (
              <DetailsPanel
                title={title}
                setTitle={setTitle}
                content={content}
                update={update}
              />
            )}
            {tab === "Design" && (
              <DesignPanel content={content} update={update} />
            )}
            {tab === "Sections" && (
              <SectionsPanel content={content} update={update} />
            )}
            {tab === "RSVP form" && (
              <RsvpPanel content={content} update={update} />
            )}
            {tab === "Publish" && (
              <PublishPanel
                slug={slug}
                setSlug={setSlug}
                published={published}
                origin={origin}
                busy={state === "saving"}
                onTogglePublish={() => void save(!published)}
                onDelete={() => void remove()}
              />
            )}
          </div>
        </aside>

        <section aria-label="Live preview" className="bg-stone-100 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-stone-600">Live preview</p>
            <div className="flex rounded-lg border border-stone-300 bg-white p-0.5 text-sm">
              {(["desktop", "phone"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={device === d}
                  onClick={() => setDevice(d)}
                  className={`rounded-md px-3 py-1 capitalize ${
                    device === d ? "bg-stone-900 text-white" : "text-stone-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div
            className={`mx-auto overflow-y-auto rounded-xl border border-stone-300 shadow-sm lg:h-[calc(100vh-10rem)] ${
              device === "phone" ? "max-w-[390px]" : "w-full"
            }`}
          >
            <EventPageView
              title={title || "Untitled event"}
              content={content}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
