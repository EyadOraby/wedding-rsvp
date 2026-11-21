import Link from "next/link";
import { APP_NAME } from "@/config/app";

/** The app mark (an envelope with a dot) and name, linking home. */
export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 font-semibold tracking-tight"
    >
      <svg viewBox="0 0 64 64" className="h-7 w-7" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="#1c1917" />
        <path
          d="M13 23h38v20a5 5 0 0 1-5 5H18a5 5 0 0 1-5-5z"
          fill="none"
          stroke="#fafaf9"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="m14 24 18 13 18-13"
          fill="none"
          stroke="#fafaf9"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="48"
          cy="18"
          r="7"
          fill="#e2622b"
          stroke="#1c1917"
          strokeWidth="2.5"
        />
      </svg>
      {APP_NAME}
    </Link>
  );
}
