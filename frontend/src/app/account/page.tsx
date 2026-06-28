"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppBrand } from "@/components/app-brand";
import { getCurrentUser, logoutSession, updateEmail, updatePassword } from "@/lib/auth";
import {
  surfaceClassName,
} from "@/components/ui/styles";
import { Button, Card, LinkButton, Panel, Skeleton, TextInput } from "@/components/ui/primitives";
import type { User } from "@/lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [currentEmailPassword, setCurrentEmailPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      try {
        const user = await getCurrentUser();
        if (!cancelled) {
          setCurrentUser(user);
          setEmail(user?.email ?? "");
          setNewEmail(user?.email ?? "");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await logoutSession();
    router.push("/auth");
    router.refresh();
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSavingEmail(true);

    try {
      const updatedUser = await updateEmail(currentEmailPassword, newEmail);
      setCurrentUser(updatedUser);
      setEmail(updatedUser.email);
      setNewEmail(updatedUser.email);
      setCurrentEmailPassword("");
      setMessage("Email updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update email.");
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSavingPassword(true);

    try {
      const updatedUser = await updatePassword(currentPassword, newPassword);
      setCurrentUser(updatedUser);
      setEmail(updatedUser.email);
      setNewEmail(updatedUser.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-[calc(100%-32px)] max-w-[760px] items-center py-8 max-sm:w-[calc(100%-24px)] max-sm:py-5">
      <Panel className="w-full">
        <header className="flex items-start justify-between gap-4 border-b border-line p-7 max-sm:flex-col max-sm:p-5">
          <div>
            <AppBrand />
            <div className="text-ink-onDark/75">Account settings</div>
          </div>
          <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
            <LinkButton href="/">
              Close
            </LinkButton>
            <Button variant="panel" type="button" onClick={() => void logout()}>
              Logout
            </Button>
          </div>
        </header>

        <div className={`grid gap-6 ${surfaceClassName} p-7 max-sm:p-5`}>
          {isLoading ? (
            <AccountSkeleton />
          ) : !currentUser ? (
            <Card className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="font-display text-xl">Sign in to manage your account.</div>
                <div className="mt-1 text-sm text-ink-muted">
                  Email and password updates are available after login.
                </div>
              </div>
              <LinkButton variant="primary" href="/auth">
                Sign in
              </LinkButton>
            </Card>
          ) : (
            <>
              {message ? <Card className="p-4">{message}</Card> : null}

              <form className="grid gap-4 border border-line bg-panel p-5" onSubmit={submitEmail}>
                <div>
                  <h2 className="m-0 font-display text-2xl leading-tight">Email</h2>
                  <p className="m-0 mt-1 text-sm text-ink-muted">
                    Update your email address.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="current-email-password">
                    Current password
                  </label>
                  <TextInput
                    className="mt-2"
                    id="current-email-password"
                    minLength={8}
                    type="password"
                    value={currentEmailPassword}
                    onChange={(event) => setCurrentEmailPassword(event.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="new-email">
                    New email
                  </label>
                  <TextInput
                    className="mt-2"
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
                  <div className="min-w-0 break-all text-sm text-ink-muted">Current email: {email}</div>
                  <Button variant="primary" disabled={isSavingEmail} type="submit">
                    {isSavingEmail ? "Saving" : "Update email"}
                  </Button>
                </div>
              </form>

              <form className="grid gap-4 border border-line bg-panel p-5" onSubmit={submitPassword}>
                <div>
                  <h2 className="m-0 font-display text-2xl leading-tight">Password</h2>
                  <p className="m-0 mt-1 text-sm text-ink-muted">
                    Update your password.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="current-password">
                    Current password
                  </label>
                  <TextInput
                    className="mt-2"
                    id="current-password"
                    minLength={8}
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="new-password">
                    New password
                  </label>
                  <TextInput
                    className="mt-2"
                    id="new-password"
                    minLength={8}
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold" htmlFor="confirm-password">
                    Confirm password
                  </label>
                  <TextInput
                    className="mt-2"
                    id="confirm-password"
                    minLength={8}
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <Button variant="primary" disabled={isSavingPassword} type="submit">
                    {isSavingPassword ? "Saving" : "Update password"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </Panel>
    </main>
  );
}

function AccountSkeleton() {
  return (
    <Card className="grid gap-4 p-5" aria-label="Loading account">
      <Skeleton className="h-6 w-44" />
      <Skeleton className="h-control" />
      <Skeleton className="h-control" />
    </Card>
  );
}
