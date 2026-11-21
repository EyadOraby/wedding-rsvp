import type { Metadata } from "next";
import Link from "next/link";
import { TemplatePicker } from "@/components/builder/TemplatePicker";
import { APP_NAME } from "@/config/app";

export const metadata: Metadata = { title: `New event · ${APP_NAME}` };

export default function NewEventPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        ← Your events
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Start with a template
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Everything can be changed afterwards: text, design, sections and
        questions.
      </p>
      <div className="mt-8">
        <TemplatePicker />
      </div>
    </main>
  );
}
