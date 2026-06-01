"use client";

import { FormEvent, useState } from "react";
import { SectionDivider } from "./SectionDivider";

type Meal = {
  id: string;
  title: string;
  description: string;
  tag?: string | null;
};

type Dietary = {
  id: string;
  label: string;
};

type RsvpFormProps = {
  heading: string;
  meals: Meal[];
  dietary: Dietary[];
};

export function RsvpForm({ heading, meals, dietary }: RsvpFormProps) {
  const [attending, setAttending] = useState<boolean | null>(null);
  const [mealId, setMealId] = useState("");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [dietaryOther, setDietaryOther] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function toggleDietary(label: string) {
    setSelectedDietary((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = new FormData(e.currentTarget);
    const guestName = String(form.get("guestName") ?? "");
    const email = String(form.get("email") ?? "");
    const guestCount = Number(form.get("guestCount") ?? 1);
    const message = String(form.get("message") ?? "");

    if (attending === null) {
      setStatus("error");
      setErrorMsg("Please let us know if you can attend.");
      return;
    }

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName,
          email,
          attending,
          guestCount,
          mealOptionId: attending ? mealId : null,
          dietaryLabels: attending ? selectedDietary : [],
          dietaryOther: attending ? dietaryOther : null,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setStatus("success");
      e.currentTarget.reset();
      setAttending(null);
      setMealId("");
      setSelectedDietary([]);
      setDietaryOther("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <section className="px-6 max-w-lg mx-auto text-center py-12">
        <p className="heading-spaced text-xl mb-4">Thank you</p>
        <p className="text-muted">
          Your response has been received. We cannot wait to celebrate with you.
        </p>
      </section>
    );
  }

  return (
    <section className="px-6 max-w-lg mx-auto w-full pb-16">
      <h2 className="heading-spaced text-center text-xl md:text-2xl font-medium mb-8">
        {heading}
      </h2>
      <SectionDivider />

      <form onSubmit={handleSubmit} className="space-y-10 mt-10">
        <div className="space-y-6">
          <label className="block">
            <span className="section-title text-muted text-[0.6rem] block mb-2">
              Full name
            </span>
            <input
              name="guestName"
              required
              className="input-field"
              placeholder="Your name"
            />
          </label>
          <label className="block">
            <span className="section-title text-muted text-[0.6rem] block mb-2">
              Email (optional)
            </span>
            <input
              name="email"
              type="email"
              className="input-field"
              placeholder="you@email.com"
            />
          </label>
        </div>

        <div>
          <p className="section-title text-muted text-[0.6rem] mb-4 text-center">
            Will you be attending?
          </p>
          <div className="flex justify-center gap-6">
            {[
              { value: true, label: "Joyfully accepts" },
              { value: false, label: "Regretfully declines" },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setAttending(opt.value)}
                className={`px-5 py-2 text-sm tracking-widest uppercase border transition-colors ${
                  attending === opt.value
                    ? "border-accent bg-accent text-white"
                    : "border-charcoal/30 hover:border-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {attending && (
          <>
            <label className="block text-center">
              <span className="section-title text-muted text-[0.6rem] block mb-2">
                Number of guests
              </span>
              <input
                name="guestCount"
                type="number"
                min={1}
                max={10}
                defaultValue={1}
                className="input-field text-center max-w-[4rem] mx-auto"
              />
            </label>

            <div>
              <p className="text-center text-sm mb-6 leading-relaxed">
                Choose your preferred plated main meal option:
              </p>
              <div className="space-y-4">
                {meals.map((meal) => (
                  <label key={meal.id} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="meal"
                      value={meal.id}
                      className="meal-radio sr-only"
                      checked={mealId === meal.id}
                      onChange={() => setMealId(meal.id)}
                      required
                    />
                    <div className="meal-card border border-charcoal/20 bg-card p-6 transition-all hover:border-accent/50">
                      <p className="font-medium mb-2">
                        {meal.title}
                        {meal.tag && (
                          <span className="text-accent ml-2 text-sm">
                            ({meal.tag})
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-muted leading-relaxed">
                        {meal.description}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-center text-sm mb-6">
                Please let us know if you have any dietary requirement or
                allergies:
              </p>
              <div className="space-y-3 max-w-xs mx-auto">
                {dietary.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-start gap-3 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      className="checkbox-custom"
                      checked={selectedDietary.includes(opt.label)}
                      onChange={() => toggleDietary(opt.label)}
                    />
                    <span className="capitalize">{opt.label}</span>
                  </label>
                ))}
                <label className="flex items-start gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={dietaryOther.length > 0}
                    onChange={(e) => {
                      if (!e.target.checked) setDietaryOther("");
                    }}
                    readOnly
                    style={{ opacity: dietaryOther ? 1 : 0.4 }}
                  />
                  <span className="flex-1">
                    Other:{" "}
                    <input
                      type="text"
                      value={dietaryOther}
                      onChange={(e) => setDietaryOther(e.target.value)}
                      className="input-field inline-block w-full mt-1"
                      placeholder="Please specify"
                    />
                  </span>
                </label>
              </div>
            </div>
          </>
        )}

        <label className="block">
          <span className="section-title text-muted text-[0.6rem] block mb-2 text-center">
            Message (optional)
          </span>
          <textarea
            name="message"
            rows={3}
            className="input-field resize-none"
            placeholder="Share a note with the couple"
          />
        </label>

        {status === "error" && errorMsg && (
          <p className="text-center text-sm text-red-700">{errorMsg}</p>
        )}

        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-10 py-3 bg-accent text-white text-sm tracking-[0.2em] uppercase hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Sending…" : "Submit RSVP"}
          </button>
        </div>
      </form>
    </section>
  );
}
