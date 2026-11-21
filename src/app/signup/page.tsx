import type { Metadata } from "next";
import { AuthPage } from "@/components/app/AuthPage";
import { APP_NAME } from "@/config/app";

export const metadata: Metadata = { title: `Sign up · ${APP_NAME}` };

export default function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <AuthPage mode="signup" searchParams={searchParams} />;
}
