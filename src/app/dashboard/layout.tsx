import Link from "next/link";
import { LogoutButton } from "@/components/app/LogoutButton";
import { APP_NAME } from "@/config/app";
import { requireUserPage } from "@/lib/auth";

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
          <Link href="/dashboard" className="font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-stone-600 sm:inline">
              {user.name}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
