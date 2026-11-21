"use client";

import { useState, type FormEvent } from "react";
import { otherKey, visibleQuestions, type Answers } from "@/lib/events/answers";
import type { EventContent, Question } from "@/lib/events/content";
import { formatShortDate } from "@/lib/events/format";
import { SectionTitle } from "./sections";

type Props = {
  title: string;
  content: EventContent;
  /** Public slug; omitted in the builder preview, where nothing is sent. */
  slug?: string;
  closed?: boolean;
};

type Status = "idle" | "sending" | "sent" | "error";

function Required({ show }: { show: boolean }) {
  return show ? (
    <span className="ev-muted" aria-hidden="true">
      {" "}
      *
    </span>
  ) : null;
}

function QuestionField({
  question,
  answers,
  setAnswer,
}: {
  question: Question;
  answers: Answers;
  setAnswer: (key: string, value: Answers[string] | undefined) => void;
}) {
  const name = `q-${question.id}`;
  const legend = (
    <legend className="ev-kicker mb-3">
      {question.label}
      <Required show={question.required} />
    </legend>
  );

  switch (question.type) {
    case "single":
      return (
        <fieldset>
          {legend}
          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => (
              <label key={option.id} className="ev-choice">
                <input
                  type="radio"
                  name={name}
                  checked={answers[question.id] === option.id}
                  onChange={() => setAnswer(question.id, option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "multi": {
      const selected = (answers[question.id] as string[] | undefined) ?? [];
      const toggle = (id: string) =>
        setAnswer(
          question.id,
          selected.includes(id)
            ? selected.filter((v) => v !== id)
            : [...selected, id],
        );
      return (
        <fieldset>
          {legend}
          <div className="grid gap-2 sm:grid-cols-2">
            {question.options.map((option) => (
              <label key={option.id} className="ev-choice">
                <input
                  type="checkbox"
                  checked={selected.includes(option.id)}
                  onChange={() => toggle(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
          {question.allowOther && (
            <input
              aria-label={`${question.label}: other`}
              placeholder="Other (please specify)"
              maxLength={200}
              className="ev-input mt-3"
              value={(answers[otherKey(question.id)] as string) ?? ""}
              onChange={(e) =>
                setAnswer(otherKey(question.id), e.target.value || undefined)
              }
            />
          )}
        </fieldset>
      );
    }
    case "yesno":
      return (
        <fieldset>
          {legend}
          <div className="flex gap-2">
            {[true, false].map((value) => (
              <label key={String(value)} className="ev-choice">
                <input
                  type="radio"
                  name={name}
                  checked={answers[question.id] === value}
                  onChange={() => setAnswer(question.id, value)}
                />
                {value ? "Yes" : "No"}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "text":
    case "longtext": {
      const Field = question.type === "text" ? "input" : "textarea";
      return (
        <div>
          <label htmlFor={name} className="ev-kicker mb-1 block">
            {question.label}
            <Required show={question.required} />
          </label>
          <Field
            id={name}
            className="ev-input"
            maxLength={question.type === "text" ? 300 : 2000}
            rows={question.type === "longtext" ? 3 : undefined}
            value={(answers[question.id] as string) ?? ""}
            onChange={(e) =>
              setAnswer(question.id, e.target.value || undefined)
            }
          />
        </div>
      );
    }
  }
}

export function EventRsvpForm({ title, content, slug, closed }: Props) {
  const { rsvp } = content;
  const section = content.sections.find((s) => s.type === "rsvp");
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const preview = !slug;

  const setAnswer = (key: string, value: Answers[string] | undefined) =>
    setAnswers((current) => {
      const next = { ...current };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (preview || status === "sending") return;
    if (attending === null) {
      setStatus("error");
      setError("Please let us know if you can come");
      return;
    }
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`/api/e/${slug}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email") ?? null,
          message: form.get("message"),
          website: form.get("website"),
          attending,
          guestCount: attending ? guestCount : 1,
          answers,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "sent") {
    return (
      <div className="text-center" role="status">
        <SectionTitle>Thank you</SectionTitle>
        <p className="leading-relaxed">
          {rsvp.thankYouMessage || "Your reply has been received."}
        </p>
        {content.details.date && (
          <a
            href={`/e/${slug}/calendar`}
            className="ev-link mt-4 inline-block text-sm"
          >
            Add {title} to your calendar
          </a>
        )}
      </div>
    );
  }

  const questions =
    attending === null ? [] : visibleQuestions(content, attending);

  return (
    <div>
      <SectionTitle>{section?.title || "RSVP"}</SectionTitle>
      {rsvp.deadline && (
        <p className="ev-muted -mt-4 mb-8 text-center text-sm">
          Kindly reply by {formatShortDate(rsvp.deadline)}
        </p>
      )}
      {closed && !preview ? (
        <p className="text-center">Replies for this event are now closed.</p>
      ) : (
        <form onSubmit={handleSubmit} className="relative space-y-8">
          {/* Hidden from people; bots that fill in every field get caught. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px overflow-hidden"
          >
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <div>
            <label htmlFor="rsvp-name" className="ev-kicker mb-1 block">
              Full name
              <Required show />
            </label>
            <input
              id="rsvp-name"
              name="name"
              required
              maxLength={100}
              autoComplete="name"
              className="ev-input"
            />
          </div>

          {rsvp.collectEmail !== "off" && (
            <div>
              <label htmlFor="rsvp-email" className="ev-kicker mb-1 block">
                Email
                {rsvp.collectEmail === "optional" ? " (optional)" : ""}
                <Required show={rsvp.collectEmail === "required"} />
              </label>
              <input
                id="rsvp-email"
                name="email"
                type="email"
                required={rsvp.collectEmail === "required"}
                maxLength={200}
                autoComplete="email"
                className="ev-input"
              />
            </div>
          )}

          <fieldset className="text-center">
            <legend className="ev-kicker mx-auto mb-3">
              Will you be there?
              <Required show />
            </legend>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { value: true, label: "Yes, I'll be there" },
                { value: false, label: "Sorry, I can't" },
              ].map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  aria-pressed={attending === option.value}
                  onClick={() => setAttending(option.value)}
                  className="ev-toggle"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {attending && rsvp.allowPlusOnes && rsvp.maxGuests > 1 && (
            <div>
              <label htmlFor="rsvp-guests" className="ev-kicker mb-1 block">
                How many people, including you?
              </label>
              <select
                id="rsvp-guests"
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="ev-input"
              >
                {Array.from({ length: rsvp.maxGuests }, (_, i) => i + 1).map(
                  (n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ),
                )}
              </select>
            </div>
          )}

          {questions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              answers={answers}
              setAnswer={setAnswer}
            />
          ))}

          <div>
            <label htmlFor="rsvp-message" className="ev-kicker mb-1 block">
              Message (optional)
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              rows={2}
              maxLength={1000}
              className="ev-input"
            />
          </div>

          {status === "error" && error && (
            <p role="alert" className="text-center text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="text-center">
            <button
              type="submit"
              disabled={preview || status === "sending"}
              className="ev-button"
            >
              {status === "sending" ? "Sending…" : "Send reply"}
            </button>
            {preview && (
              <p className="ev-muted mt-3 text-xs">
                Preview only: replies are not sent from the builder.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
