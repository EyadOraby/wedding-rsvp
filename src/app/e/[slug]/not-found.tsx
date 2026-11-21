import Link from "next/link";
import { Logo } from "@/components/app/Logo";

export default function EventNotFound() {
  return (
    <main className="app flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Logo />
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          This invitation isn&apos;t available
        </h1>
        <p className="mx-auto mt-2 max-w-md text-stone-600">
          The host may not have published it yet, or the link may be mistyped.
          Check the link you were sent, or ask the host for a new one.
        </p>
      </div>
      <Link href="/" className="app-button-secondary">
        Make your own RSVP page
      </Link>
    </main>
  );
}
