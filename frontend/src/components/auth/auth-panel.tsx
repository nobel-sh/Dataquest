"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, login, logoutSession, register } from "@/lib/auth";
import type { User } from "@/lib/types";

const inputClassName =
  "min-h-control w-full border border-line bg-[#30333d] px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted/70 hover:border-[#5f6368] focus:border-accent focus:bg-[#333642] focus:shadow-focus";

const buttonClassName =
  "min-h-control border border-accent bg-accent px-6 py-2 font-bold tracking-wide text-ink-button shadow-[0_8px_18px_rgba(161,66,244,0.22)] transition hover:border-accent-hover hover:bg-accent-hover focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-65";

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const user = await getCurrentUser();
        if (!cancelled) {
          setCurrentUser(user);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSession(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      const result =
        mode === "login" ? await login(email, password) : await register(email, password);
      setCurrentUser(result.user);
      router.push("/forms");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    await logoutSession();
    setCurrentUser(null);
    setMessage("Logged out.");
    router.refresh();
  }

  return (
    <section className="border border-line bg-panel shadow-panel">
      <header className="border-b border-line p-7 max-sm:p-5">
        <p className="m-0 text-sm uppercase text-ink-muted">Account</p>
        <h1 className="m-0 mt-2 font-display text-[clamp(30px,4vw,46px)] leading-tight">
          {mode === "login" ? "Login" : "Register"}
        </h1>
      </header>

      <div className="border-b border-line bg-[#181a20] p-7 max-sm:p-5">
        <div className="flex items-center justify-between gap-4 border border-line bg-panel p-4 max-sm:flex-col max-sm:items-stretch">
          <div>
            <div className="text-sm uppercase text-ink-muted">Current session</div>
            <div className="mt-1 font-semibold">
              {isLoadingSession ? "Checking session..." : currentUser?.email ?? "Not logged in"}
            </div>
          </div>
          {currentUser ? (
            <button
              className="min-h-control border border-line bg-[#30333d] px-4 py-2 font-semibold text-ink transition hover:border-accent hover:bg-[#333642]"
              type="button"
              onClick={logout}
            >
              Logout
            </button>
          ) : null}
        </div>
      </div>

      <form onSubmit={submit}>
        <div className="grid gap-5 bg-[#181a20] p-7 max-sm:p-5">
          {message ? (
            <div className="border border-line-error bg-error px-4 py-4">{message}</div>
          ) : null}
          <div>
            <label className="text-base font-semibold" htmlFor="email">
              Email
            </label>
            <input
              className={`${inputClassName} mt-2`}
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className="text-base font-semibold" htmlFor="password">
              Password
            </label>
            <input
              className={`${inputClassName} mt-2`}
              id="password"
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-panel px-7 py-5 max-sm:flex-col max-sm:items-stretch max-sm:p-5">
          <button
            className="min-h-control border border-line bg-[#30333d] px-4 py-2 font-semibold text-ink transition hover:border-accent hover:bg-[#333642]"
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create account" : "Use login"}
          </button>
          <button className={buttonClassName} disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving" : mode === "login" ? "Login" : "Register"}
          </button>
        </div>
      </form>
    </section>
  );
}
