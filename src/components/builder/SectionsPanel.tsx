"use client";

import { useState } from "react";
import {
  ADDABLE_SECTION_TYPES,
  newSection,
  SECTION_CATALOG,
} from "@/lib/events/catalog";
import type { EventContent, Section } from "@/lib/events/content";
import { ListControls, move, TextField } from "./ui";

export type Update = (change: (draft: EventContent) => void) => void;

type ItemField<T> = {
  key: keyof T & string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
};

/** Edits a list of small records, e.g. schedule rows or FAQ entries. */
function ItemsEditor<T extends Record<string, string>>({
  items,
  fields,
  onChange,
  blank,
  name,
}: {
  items: T[];
  fields: ItemField<T>[];
  onChange: (items: T[]) => void;
  blank: T;
  name: string;
}) {
  const set = (index: number, key: keyof T, value: string) =>
    onChange(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-lg border border-stone-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">
              {name} {index + 1}
            </span>
            <ListControls
              index={index}
              count={items.length}
              name={name.toLowerCase()}
              onMove={(from, to) => onChange(move(items, from, to))}
              onRemove={() => onChange(items.filter((_, i) => i !== index))}
            />
          </div>
          <div className="space-y-2">
            {fields.map((field) => (
              <TextField
                key={field.key}
                label={field.label}
                value={item[field.key]}
                placeholder={field.placeholder}
                multiline={field.multiline}
                onChange={(value) => set(index, field.key, value)}
              />
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { ...blank }])}
        className="app-button-secondary w-full"
      >
        Add {name.toLowerCase()}
      </button>
    </div>
  );
}

function SectionEditor({
  section,
  index,
  update,
}: {
  section: Section;
  index: number;
  update: Update;
}) {
  const edit = (change: (s: Section) => void) =>
    update((draft) => change(draft.sections[index]));

  const body = (label: string) =>
    "body" in section && (
      <TextField
        label={label}
        multiline
        maxLength={3000}
        value={section.body}
        onChange={(v) => edit((s) => "body" in s && (s.body = v))}
      />
    );

  return (
    <div className="space-y-3">
      <TextField
        label="Heading"
        value={section.title}
        maxLength={60}
        onChange={(v) => edit((s) => (s.title = v))}
      />
      {section.type === "story" && body("Text")}
      {section.type === "dressCode" && body("What to wear")}
      {section.type === "location" && (
        <TextField
          label="Directions or parking notes"
          multiline
          maxLength={500}
          hint="The venue, address and map link come from Details."
          value={section.note}
          onChange={(v) => edit((s) => s.type === "location" && (s.note = v))}
        />
      )}
      {section.type === "countdown" && (
        <p className="text-sm text-stone-500">
          Counts down to the event date set in Details.
        </p>
      )}
      {section.type === "rsvp" && (
        <p className="text-sm text-stone-500">
          Set up the questions in the RSVP form tab.
        </p>
      )}
      {section.type === "schedule" && (
        <ItemsEditor
          name="Item"
          items={section.items}
          blank={{ time: "", label: "", note: "" }}
          fields={[
            { key: "time", label: "Time", placeholder: "16:00" },
            { key: "label", label: "What happens" },
            { key: "note", label: "Note (optional)" },
          ]}
          onChange={(items) =>
            edit((s) => s.type === "schedule" && (s.items = items))
          }
        />
      )}
      {section.type === "gifts" && (
        <>
          {body("Text")}
          <ItemsEditor
            name="Detail"
            items={section.items}
            blank={{ label: "", value: "" }}
            fields={[
              { key: "label", label: "Label", placeholder: "Bank or Registry" },
              {
                key: "value",
                label: "Value",
                placeholder: "Account number or https:// link",
              },
            ]}
            onChange={(items) =>
              edit((s) => s.type === "gifts" && (s.items = items))
            }
          />
        </>
      )}
      {section.type === "faq" && (
        <ItemsEditor
          name="Question"
          items={section.items}
          blank={{ question: "", answer: "" }}
          fields={[
            { key: "question", label: "Question" },
            { key: "answer", label: "Answer", multiline: true },
          ]}
          onChange={(items) =>
            edit((s) => s.type === "faq" && (s.items = items))
          }
        />
      )}
    </div>
  );
}

export function SectionsPanel({
  content,
  update,
}: {
  content: EventContent;
  update: Update;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const { sections } = content;

  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600">
        Choose what your page shows and in which order. The RSVP form can move
        but is always on.
      </p>
      {sections.map((section, index) => {
        const label = SECTION_CATALOG[section.type].label;
        const isOpen = open === section.id;
        return (
          <div key={section.id} className="app-card">
            <div className="flex items-center gap-2 p-3">
              <input
                type="checkbox"
                aria-label={`Show ${label}`}
                checked={section.enabled}
                disabled={section.type === "rsvp"}
                onChange={(e) =>
                  update((d) => {
                    const s = d.sections[index];
                    if (s.type !== "rsvp") s.enabled = e.target.checked;
                  })
                }
                className="h-4 w-4 accent-stone-900"
              />
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : section.id)}
                className="min-w-0 flex-1 text-left"
              >
                <span
                  className={`block truncate text-sm font-medium ${
                    section.enabled ? "" : "text-stone-400"
                  }`}
                >
                  {section.title || label}
                </span>
                <span className="block text-xs text-stone-500">
                  {label} · {isOpen ? "close" : "edit"}
                </span>
              </button>
              <ListControls
                index={index}
                count={sections.length}
                name={label}
                onMove={(from, to) =>
                  update((d) => {
                    d.sections = move(d.sections, from, to);
                  })
                }
                onRemove={
                  section.type === "rsvp"
                    ? undefined
                    : () =>
                        update((d) => {
                          d.sections.splice(index, 1);
                        })
                }
              />
            </div>
            {isOpen && (
              <div className="border-t border-stone-200 p-3">
                <SectionEditor
                  section={section}
                  index={index}
                  update={update}
                />
              </div>
            )}
          </div>
        );
      })}
      <select
        aria-label="Add a section"
        value=""
        onChange={(e) => {
          const section = newSection(e.target.value as Section["type"]);
          update((d) => {
            d.sections.push(section);
          });
          setOpen(section.id);
        }}
        className="app-input"
      >
        <option value="" disabled>
          + Add a section…
        </option>
        {ADDABLE_SECTION_TYPES.map((type) => (
          <option key={type} value={type}>
            {SECTION_CATALOG[type].label}: {SECTION_CATALOG[type].description}
          </option>
        ))}
      </select>
    </div>
  );
}
