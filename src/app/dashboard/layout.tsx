import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/app/Logo";
import { LogoutButton } from "@/components/app/LogoutButton";
import { requireUserPage } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUserPage();
  return (
    <div className="app">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/account"
              className="hidden text-sm text-stone-600 hover:text-stone-900 sm:inline"
            >
              {user.name}
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
