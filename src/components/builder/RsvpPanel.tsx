"use client";

import { newQuestion, QUESTION_CATALOG } from "@/lib/events/catalog";
import {
  createId,
  type EventContent,
  type Question,
  type QuestionType,
} from "@/lib/events/content";
import type { Update } from "./SectionsPanel";
import { Field, IconButton, ListControls, move, TextField, Toggle } from "./ui";

function QuestionEditor({
  question,
  index,
  count,
  update,
}: {
  question: Question;
  index: number;
  count: number;
  update: Update;
}) {
  const edit = (change: (q: Question) => void) =>
    update((draft) => change(draft.rsvp.questions[index]));
  const hasOptions = question.type === "single" || question.type === "multi";

  return (
    <div className="app-card space-y-3 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {QUESTION_CATALOG[question.type].label}
        </span>
        <ListControls
          index={index}
          count={count}
          name="question"
          onMove={(from, to) =>
            update((d) => {
              d.rsvp.questions = move(d.rsvp.questions, from, to);
            })
          }
          onRemove={() =>
            update((d) => {
              d.rsvp.questions.splice(index, 1);
            })
          }
        />
      </div>
      <TextField
        label="Question"
        value={question.label}
        maxLength={150}
        onChange={(v) => edit((q) => (q.label = v))}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Toggle
          label="Required"
          checked={question.required}
          onChange={(v) => edit((q) => (q.required = v))}
        />
        <label className="flex items-center gap-2 text-sm text-stone-700">
          Ask
          <select
            value={question.showWhen}
            onChange={(e) =>
              edit((q) => (q.showWhen = e.target.value as Question["showWhen"]))
            }
            className="rounded-md border border-stone-300 bg-white px-2 py-1 text-sm"
          >
            <option value="attending">guests who are coming</option>
            <option value="always">everyone</option>
          </select>
        </label>
      </div>
      {hasOptions && (
        <div className="space-y-2">
          <p className="app-label">Options</p>
          {question.options.map((option, i) => (
            <div key={option.id} className="flex items-center gap-1">
              <input
                aria-label={`Option ${i + 1}`}
                value={option.label}
                maxLength={80}
                onChange={(e) =>
                  edit((q) => {
                    if ("options" in q) q.options[i].label = e.target.value;
                  })
                }
                className="app-input"
              />
              <IconButton
                label={`Remove option ${i + 1}`}
                disabled={question.options.length === 1}
                onClick={() =>
                  edit((q) => {
                    if ("options" in q) q.options.splice(i, 1);
                  })
                }
              >
                ✕
              </IconButton>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              edit((q) => {
                if ("options" in q) {
                  q.options.push({
                    id: createId("opt"),
                    label: `Option ${q.options.length + 1}`,
                  });
                }
              })
            }
            className="text-sm font-medium text-stone-700 hover:text-stone-900"
          >
            + Add option
          </button>
          {question.type === "multi" && (
            <Toggle
              label='Allow an "Other" answer'
              checked={question.allowOther}
              onChange={(v) =>
                edit((q) => q.type === "multi" && (q.allowOther = v))
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

export function RsvpPanel({
  content,
  update,
}: {
  content: EventContent;
  update: Update;
}) {
  const { rsvp } = content;
  return (
    <div className="space-y-5">
      <TextField
        label="Reply by"
        type="date"
        hint="Replies close after this day. Leave empty for no deadline."
        value={rsvp.deadline}
        onChange={(v) => update((d) => (d.rsvp.deadline = v))}
      />
      <div className="space-y-3">
        <Toggle
          label="Guests can reply for more than one person"
          checked={rsvp.allowPlusOnes}
          onChange={(v) => update((d) => (d.rsvp.allowPlusOnes = v))}
        />
        {rsvp.allowPlusOnes && (
          <Field label="Most people per reply, including the guest">
            {(id) => (
              <input
                id={id}
                type="number"
                min={1}
                max={20}
                value={rsvp.maxGuests}
                onChange={(e) =>
                  update(
                    (d) =>
                      (d.rsvp.maxGuests = Math.min(
                        20,
                        Math.max(1, Math.round(Number(e.target.value)) || 1),
                      )),
                  )
                }
                className="app-input w-24"
              />
            )}
          </Field>
        )}
      </div>
      <Field label="Ask for an email address">
        {(id) => (
          <select
            id={id}
            value={rsvp.collectEmail}
            onChange={(e) =>
              update(
                (d) =>
                  (d.rsvp.collectEmail = e.target
                    .value as EventContent["rsvp"]["collectEmail"]),
              )
            }
            className="app-input"
          >
            <option value="off">No</option>
            <option value="optional">Optional</option>
            <option value="required">Required</option>
          </select>
        )}
      </Field>
      <TextField
        label="Thank-you message"
        multiline
        maxLength={300}
        value={rsvp.thankYouMessage}
        onChange={(v) => update((d) => (d.rsvp.thankYouMessage = v))}
      />

      <div className="space-y-3 border-t border-stone-200 pt-5">
        <div>
          <h3 className="font-medium">Questions</h3>
          <p className="text-sm text-stone-600">
            Name, attendance and a message are always asked.
          </p>
        </div>
        {rsvp.questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            index={index}
            count={rsvp.questions.length}
            update={update}
          />
        ))}
        <select
          aria-label="Add a question"
          value=""
          disabled={rsvp.questions.length >= 15}
          onChange={(e) => {
            const question = newQuestion(e.target.value as QuestionType);
            update((d) => {
              d.rsvp.questions.push(question);
            });
          }}
          className="app-input"
        >
          <option value="" disabled>
            + Add a question…
          </option>
          {(Object.keys(QUESTION_CATALOG) as QuestionType[]).map((type) => (
            <option key={type} value={type}>
              {QUESTION_CATALOG[type].label}:{" "}
              {QUESTION_CATALOG[type].description}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
