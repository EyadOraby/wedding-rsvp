import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/accounts";
import { getSessionUserId } from "@/lib/auth";
import { AuthForm } from "./AuthForm";
import { Logo } from "./Logo";

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
      <Logo />
      <AuthForm mode={mode} next={next} />
    </main>
  );
}
