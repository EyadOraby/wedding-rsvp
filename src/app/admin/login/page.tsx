"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const password = new FormData(e.currentTarget).get("password");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Invalid password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-cream">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-card p-10 shadow-sm border border-black/5"
      >
        <h1 className="heading-spaced text-center text-lg mb-8">Admin</h1>
        <label className="block mb-6">
          <span className="section-title text-muted text-[0.6rem] block mb-2">
            Password
          </span>
          <input
            name="password"
            type="password"
            required
            className="input-field"
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700 text-center mb-4">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent text-white text-sm tracking-[0.2em] uppercase hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
