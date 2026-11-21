import type { Metadata } from "next";
import Link from "next/link";
import { AccountSettings } from "@/components/app/AccountSettings";
import { APP_NAME } from "@/config/app";
import { requireUserPage } from "@/lib/auth";

export const metadata: Metadata = { title: `Account · ${APP_NAME}` };

export default async function AccountPage() {
  const user = await requireUserPage("/dashboard/account");
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/dashboard"
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        ← Your events
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Account</h1>
      <div className="mt-6">
        <AccountSettings name={user.name} email={user.email} />
      </div>
    </main>
  );
}
