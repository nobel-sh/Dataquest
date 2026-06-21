"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppBrand } from "@/components/app-brand";
import { getCurrentUser, logoutSession, updateEmail, updatePassword } from "@/lib/auth";
import type { User } from "@/lib/types";

const inputClassName =
  "min-h-control w-full border border-line bg-[#30333d] px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted/70 hover:border-[#5f6368] focus:border-accent focus:bg-[#333642] focus:shadow-focus";

const buttonClassName =
  "inline-flex min-h-control items-center justify-center border border-accent bg-accent px-5 py-2 text-sm font-bold tracking-wide text-ink-button shadow-[0_8px_18px_rgba(161,66,244,0.22)] transition hover:border-accent-hover hover:bg-accent-hover";

const secondaryButtonClassName =
  "inline-flex min-h-control items-center justify-center border border-line bg-panel px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-ink-onDark";

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
    <main className="mx-auto flex min-h-screen w-[calc(100%-32px)] max-w-page items-center py-8 max-sm:w-[calc(100%-24px)] max-sm:py-5">
      <section className="w-full border border-line bg-panel shadow-panel">
        <header className="flex items-start justify-between gap-4 border-b border-line p-7 max-sm:flex-col max-sm:p-5">
          <div>
            <AppBrand />
            <div className="text-ink-onDark/75">Account settings</div>
          </div>
          <div className="flex gap-2 max-sm:w-full max-sm:flex-col">
            <Link className={secondaryButtonClassName} href="/">
              Close
            </Link>
            <button className={secondaryButtonClassName} type="button" onClick={() => void logout()}>
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-6 bg-[#181a20] p-7 max-sm:p-5">
          {isLoading ? (
            <div className="border border-line bg-panel p-5 text-ink-muted">Loading account...</div>
          ) : !currentUser ? (
            <div className="grid gap-4 border border-line bg-panel p-5 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <div className="font-display text-xl">Sign in to manage your account.</div>
                <div className="mt-1 text-sm text-ink-muted">
                  Email and password updates are available after login.
                </div>
              </div>
              <Link className={buttonClassName} href="/auth">
                Sign in
              </Link>
            </div>
          ) : (
            <>
              {message ? <div className="border border-line bg-panel p-4">{message}</div> : null}

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
                  <input
                    className={`${inputClassName} mt-2`}
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
                  <input
                    className={`${inputClassName} mt-2`}
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(event) => setNewEmail(event.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
                  <div className="text-sm text-ink-muted">Current email: {email}</div>
                  <button className={buttonClassName} disabled={isSavingEmail} type="submit">
                    {isSavingEmail ? "Saving" : "Update email"}
                  </button>
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
                  <input
                    className={`${inputClassName} mt-2`}
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
                  <input
                    className={`${inputClassName} mt-2`}
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
                  <input
                    className={`${inputClassName} mt-2`}
                    id="confirm-password"
                    minLength={8}
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>

                <div className="flex justify-end">
                  <button className={buttonClassName} disabled={isSavingPassword} type="submit">
                    {isSavingPassword ? "Saving" : "Update password"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
