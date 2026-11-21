import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/config/app";
import { safeNextPath } from "@/lib/accounts";
import { getSessionUserId } from "@/lib/auth";
import { AuthForm } from "./AuthForm";

export async function AuthPage({
  mode,
  searchParams,
}: {
  mode: "login" | "signup";
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNextPath((await searchParams).next);
  if (await getSessionUserId()) redirect(next);
  return (
    <main className="app flex flex-col items-center justify-center gap-8 px-4 py-16">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        {APP_NAME}
      </Link>
      <AuthForm mode={mode} next={next} />
    </main>
  );
}
