import Link from "next/link";
import { Logo } from "@/components/app/Logo";

export default function NotFound() {
  return (
    <main className="app flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <Logo />
      <div>
        <p className="text-sm font-medium text-stone-500">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-stone-600">The link may be old or mistyped.</p>
      </div>
      <Link href="/" className="app-button">
        Go to the home page
      </Link>
    </main>
  );
}
