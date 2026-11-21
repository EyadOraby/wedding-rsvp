"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-stone-600">
          Please try again. If it keeps happening, come back in a few minutes.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-stone-400">
            Reference: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="app-button">
          Try again
        </button>
        <Link href="/" className="app-button-secondary">
          Home
        </Link>
      </div>
    </main>
  );
}
