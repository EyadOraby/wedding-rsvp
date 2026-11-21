"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Status = { kind: "idle" | "saving" | "done" | "error"; message?: string };

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function Feedback({ status }: { status: Status }) {
  if (status.kind === "done") {
    return (
      <p role="status" className="text-sm text-emerald-700">
        {status.message}
      </p>
    );
  }
  if (status.kind === "error") {
    return (
      <p role="alert" className="app-error">
        {status.message}
      </p>
    );
  }
  return null;
}

export function AccountSettings({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Status>({ kind: "idle" });
  const [password, setPassword] = useState<Status>({ kind: "idle" });
  const [removal, setRemoval] = useState<Status>({ kind: "idle" });

  async function saveName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setProfile({ kind: "saving" });
    try {
      await send("/api/account", "PATCH", { name: form.get("name") });
      setProfile({ kind: "done", message: "Name saved." });
      router.refresh();
    } catch (err) {
      setProfile({ kind: "error", message: (err as Error).message });
    }
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formElement = e.currentTarget;
    const form = new FormData(formElement);
    setPassword({ kind: "saving" });
    try {
      await send("/api/account/password", "POST", {
        currentPassword: form.get("currentPassword"),
        newPassword: form.get("newPassword"),
      });
      formElement.reset();
      setPassword({ kind: "done", message: "Password changed." });
    } catch (err) {
      setPassword({ kind: "error", message: (err as Error).message });
    }
  }

  async function deleteAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (
      !window.confirm(
        "Delete your account, all of your events and every reply? This cannot be undone.",
      )
    ) {
      return;
    }
    setRemoval({ kind: "saving" });
    try {
      await send("/api/account", "DELETE", { password: form.get("password") });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setRemoval({ kind: "error", message: (err as Error).message });
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={saveName} className="app-card space-y-4 p-6">
        <h2 className="font-semibold">Profile</h2>
        <div>
          <label htmlFor="name" className="app-label">
            Name
          </label>
          <input
            id="name"
            name="name"
            defaultValue={name}
            required
            maxLength={100}
            autoComplete="name"
            className="app-input max-w-sm"
          />
        </div>
        <div>
          <p className="app-label">Email</p>
          <p className="text-sm text-stone-600">{email}</p>
        </div>
        <Feedback status={profile} />
        <button
          type="submit"
          disabled={profile.kind === "saving"}
          className="app-button"
        >
          Save name
        </button>
      </form>

      <form onSubmit={changePassword} className="app-card space-y-4 p-6">
        <h2 className="font-semibold">Password</h2>
        <div>
          <label htmlFor="currentPassword" className="app-label">
            Current password
          </label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            className="app-input max-w-sm"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="app-label">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="app-input max-w-sm"
          />
          <p className="mt-1 text-xs text-stone-500">At least 8 characters.</p>
        </div>
        <Feedback status={password} />
        <button
          type="submit"
          disabled={password.kind === "saving"}
          className="app-button"
        >
          Change password
        </button>
      </form>

      <form
        onSubmit={deleteAccount}
        className="space-y-4 rounded-xl border border-red-200 bg-white p-6"
      >
        <h2 className="font-semibold text-red-700">Delete account</h2>
        <p className="text-sm text-stone-600">
          Removes your account, every event you created and all of their
          replies. This cannot be undone.
        </p>
        <div>
          <label htmlFor="deletePassword" className="app-label">
            Confirm with your password
          </label>
          <input
            id="deletePassword"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="app-input max-w-sm"
          />
        </div>
        <Feedback status={removal} />
        <button
          type="submit"
          disabled={removal.kind === "saving"}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Delete my account
        </button>
      </form>
    </div>
  );
}
