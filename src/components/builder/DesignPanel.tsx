"use client";

import type { EventContent, HeroLayout } from "@/lib/events/content";
import { DESIGN_PRESETS } from "@/lib/events/presets";
import {
  HERO_LAYOUT_OPTIONS,
  THEME_LIST,
  THEMES,
  titleFont,
  type Theme,
} from "@/lib/events/themes";
import type { Update } from "./SectionsPanel";
import { Field, TextField } from "./ui";

/** A small sample of a theme: its background, title font and accent. */
function Swatch({ theme, accent }: { theme: Theme; accent?: string }) {
  return (
    <div
      className="flex h-14 items-center justify-center gap-3 rounded-lg"
      style={{ background: theme.colors.background, color: theme.colors.text }}
    >
      <span
        className="text-xl"
        style={{
          fontFamily: titleFont(theme),
          textTransform: theme.upperTitle ? "uppercase" : undefined,
        }}
      >
        Aa
      </span>
      <span
        className="h-4 w-4 rounded-full"
        style={{ background: accent || theme.colors.accent }}
      />
    </div>
  );
}

/** Tiny wireframe of each hero layout. */
function LayoutIcon({ layout }: { layout: HeroLayout }) {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden="true">
      <rect width="48" height="32" rx="3" className="fill-stone-100" />
      {layout === "centered" && (
        <>
          <rect
            x="14"
            y="5"
            width="20"
            height="9"
            rx="1"
            className="fill-stone-300"
          />
          <rect
            x="12"
            y="18"
            width="24"
            height="3"
            rx="1"
            className="fill-stone-500"
          />
          <rect
            x="17"
            y="24"
            width="14"
            height="2"
            rx="1"
            className="fill-stone-400"
          />
        </>
      )}
      {layout === "split" && (
        <>
          <rect width="22" height="32" rx="3" className="fill-stone-300" />
          <rect
            x="27"
            y="11"
            width="16"
            height="3"
            rx="1"
            className="fill-stone-500"
          />
          <rect
            x="27"
            y="17"
            width="11"
            height="2"
            rx="1"
            className="fill-stone-400"
          />
        </>
      )}
      {layout === "cover" && (
        <>
          <rect width="48" height="32" rx="3" className="fill-stone-600" />
          <rect
            x="12"
            y="13"
            width="24"
            height="3"
            rx="1"
            className="fill-white"
          />
          <rect
            x="17"
            y="19"
            width="14"
            height="2"
            rx="1"
            className="fill-stone-300"
          />
        </>
      )}
    </svg>
  );
}

export function DesignPanel({
  content,
  update,
}: {
  content: EventContent;
  update: Update;
}) {
  const { theme, details } = content;
  const accent = theme.accent || THEMES[theme.id].colors.accent;
  const isPreset = (p: EventContent["theme"]) =>
    p.id === theme.id && p.accent === theme.accent && p.layout === theme.layout;

  return (
    <div className="space-y-7">
      <div>
        <p className="app-label">Inspiration</p>
        <p className="mb-3 text-xs text-stone-500">
          Ready-made looks. Pick one, then fine-tune below.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DESIGN_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              aria-pressed={isPreset(preset.theme)}
              onClick={() =>
                update((d) => {
                  d.theme = { ...preset.theme };
                })
              }
              className={`rounded-xl border p-2 text-left transition-shadow ${
                isPreset(preset.theme)
                  ? "border-stone-900 ring-1 ring-stone-900"
                  : "border-stone-200 hover:shadow"
              }`}
            >
              <Swatch
                theme={THEMES[preset.theme.id]}
                accent={preset.theme.accent}
              />
              <p className="mt-2 text-sm font-medium">{preset.name}</p>
              <p className="text-xs text-stone-500">{preset.mood}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="app-label">Theme</p>
        <div className="grid grid-cols-2 gap-3">
          {THEME_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              aria-pressed={theme.id === t.id}
              onClick={() =>
                update((d) => {
                  d.theme.id = t.id;
                  d.theme.accent = "";
                })
              }
              className={`rounded-xl border p-2 text-left transition-shadow ${
                theme.id === t.id
                  ? "border-stone-900 ring-1 ring-stone-900"
                  : "border-stone-200 hover:shadow"
              }`}
            >
              <Swatch theme={t} />
              <p className="mt-2 text-sm font-medium">{t.name}</p>
              <p className="text-xs text-stone-500">{t.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="app-label">Top of the page</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(HERO_LAYOUT_OPTIONS) as HeroLayout[]).map((layout) => (
            <button
              key={layout}
              type="button"
              aria-pressed={theme.layout === layout}
              title={HERO_LAYOUT_OPTIONS[layout].description}
              onClick={() =>
                update((d) => {
                  d.theme.layout = layout;
                })
              }
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs ${
                theme.layout === layout
                  ? "border-stone-900 ring-1 ring-stone-900"
                  : "border-stone-200 hover:shadow"
              }`}
            >
              <LayoutIcon layout={layout} />
              {HERO_LAYOUT_OPTIONS[layout].label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">
          {HERO_LAYOUT_OPTIONS[theme.layout].description}. Split and cover look
          best with a cover image.
        </p>
      </div>

      <Field label="Accent colour" hint="Used for buttons, links and patterns.">
        {(id) => (
          <div className="flex items-center gap-3">
            <input
              id={id}
              type="color"
              value={accent}
              onChange={(e) =>
                update((d) => {
                  d.theme.accent = e.target.value;
                })
              }
              className="h-10 w-16 cursor-pointer rounded border border-stone-300"
            />
            <code className="text-sm text-stone-600">{accent}</code>
            {theme.accent && (
              <button
                type="button"
                onClick={() =>
                  update((d) => {
                    d.theme.accent = "";
                  })
                }
                className="text-sm text-stone-600 underline"
              >
                Use theme colour
              </button>
            )}
          </div>
        )}
      </Field>

      <TextField
        label="Cover image link (optional)"
        type="url"
        placeholder="https://…"
        hint="A wide photo works best. Paste a link to an image that is already online."
        value={details.heroImageUrl}
        onChange={(v) =>
          update((d) => {
            d.details.heroImageUrl = v;
          })
        }
      />
    </div>
  );
}
