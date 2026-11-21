"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Mode = "login" | "signup";

const COPY = {
  login: {
    title: "Welcome back",
    button: "Log in",
    switchText: "New here?",
    switchLink: "Create an account",
    switchHref: "/signup",
  },
  signup: {
    title: "Create your account",
    button: "Create account",
    switchText: "Already have an account?",
    switchLink: "Log in",
    switchHref: "/login",
  },
} satisfies Record<Mode, Record<string, string>>;

export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const copy = COPY[mode];

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPending(false);
    }
  }

  return (
    <div className="app-card w-full max-w-sm p-8 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <div>
            <label htmlFor="name" className="app-label">
              Your name
            </label>
            <input
              id="name"
              name="name"
              required
              autoComplete="name"
              className="app-input"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="app-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="app-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="app-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? 8 : undefined}
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            className="app-input"
          />
          {mode === "signup" && (
            <p className="mt-1 text-xs text-stone-500">
              At least 8 characters.
            </p>
          )}
        </div>
        {error && (
          <p role="alert" className="app-error">
            {error}
          </p>
        )}
        <button type="submit" disabled={pending} className="app-button w-full">
          {pending ? "Please wait…" : copy.button}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        {copy.switchText}{" "}
        <Link
          href={`${copy.switchHref}?next=${encodeURIComponent(next)}`}
          className="font-medium text-stone-900 underline"
        >
          {copy.switchLink}
        </Link>
      </p>
    </div>
  );
}
