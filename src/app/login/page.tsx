import type { Metadata } from "next";
import { AuthPage } from "@/components/app/AuthPage";
import { APP_NAME } from "@/config/app";

export const metadata: Metadata = { title: `Log in · ${APP_NAME}` };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return <AuthPage mode="login" searchParams={searchParams} />;
}
