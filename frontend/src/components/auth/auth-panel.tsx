"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register, requestPasswordReset, resetPassword } from "@/lib/auth";
import { useStatusBubble } from "@/components/status-bubble";
import { surfaceClassName } from "@/components/ui/styles";
import { Alert, Button, Panel, TextInput } from "@/components/ui/primitives";

type AuthMode = "login" | "register" | "forgot" | "reset";

export function AuthPanel() {
  const router = useRouter();
  const { showStatus } = useStatusBubble();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nextMessage = window.sessionStorage.getItem("dataquest_auth_message");
    if (!nextMessage) {
      return;
    }

    window.sessionStorage.removeItem("dataquest_auth_message");
    setMessage(nextMessage);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    const title =
      mode === "forgot"
        ? "Requesting reset"
        : mode === "reset"
          ? "Resetting password"
          : mode === "login"
            ? "Logging in"
            : "Creating account";
    showStatus({
      kind: "loading",
      title,
      detail: "Checking credentials.",
    });

    try {
      if (mode === "forgot") {
        const reset = await requestPasswordReset(email);
        setResetToken(reset.reset_token ?? "");
        setMessage(
          reset.reset_token
            ? "Development reset token generated. Use it below to set a new password."
            : "If that email exists, a reset link will be sent.",
        );
        setMode(reset.reset_token ? "reset" : "login");
        showStatus(
          { kind: "success", title: "Reset requested", detail: "Check the reset instructions." },
          { autoDismissMs: 2800 },
        );
        return;
      }

      if (mode === "reset") {
        await resetPassword(resetToken, password);
        setPassword("");
        setResetToken("");
        setMode("login");
        setMessage("Password reset. You can log in with the new password.");
        showStatus(
          { kind: "success", title: "Password reset", detail: "Use your new password to log in." },
          { autoDismissMs: 2800 },
        );
        return;
      }

      await (mode === "login" ? login(email, password) : register(email, password));
      showStatus(
        {
          kind: "success",
          title: mode === "login" ? "Logged in" : "Account created",
          detail: "Redirecting to your workspace.",
        },
        { autoDismissMs: 2800 },
      );
      router.push("/");
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Authentication failed.";
      setMessage(detail);
      showStatus({ kind: "error", title: "Authentication failed", detail }, { autoDismissMs: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Panel className="mx-auto w-full max-w-[620px]">
      <header className="border-b border-line p-7 max-sm:p-5">
        <p className="m-0 text-sm uppercase text-ink-muted">Account</p>
        <h1 className="m-0 mt-2 font-display text-[clamp(30px,4vw,46px)] leading-tight">
          {modeTitle(mode)}
        </h1>
      </header>

      <form onSubmit={submit}>
        <div className={`grid gap-5 ${surfaceClassName} p-7 max-sm:p-5`}>
          {message ? (
            <Alert>{message}</Alert>
          ) : null}
          {mode !== "reset" ? (
            <div>
              <label className="text-base font-semibold" htmlFor="email">
                Email
              </label>
              <TextInput
                className="mt-2"
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          ) : null}
          {mode === "reset" ? (
            <div>
              <label className="text-base font-semibold" htmlFor="reset-token">
                Reset token
              </label>
              <TextInput
                className="mt-2"
                id="reset-token"
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
              />
            </div>
          ) : null}
          {mode !== "forgot" ? (
            <div>
              <label className="text-base font-semibold" htmlFor="password">
                {mode === "reset" ? "New password" : "Password"}
              </label>
              <TextInput
                className="mt-2"
                id="password"
                minLength={8}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-panel px-7 py-5 max-sm:flex-col max-sm:items-stretch max-sm:p-5">
          <div className="flex flex-wrap gap-2 max-sm:grid max-sm:grid-cols-1">
            <Button variant="secondary" type="button" onClick={() => setMode("login")}>
              Login
            </Button>
            <Button variant="secondary" type="button" onClick={() => setMode("register")}>
              Create account
            </Button>
            <Button variant="secondary" type="button" onClick={() => setMode("forgot")}>
              Forgot password
            </Button>
          </div>
          <Button variant="primaryLarge" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving" : submitLabel(mode)}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function modeTitle(mode: AuthMode): string {
  if (mode === "register") {
    return "Register";
  }
  if (mode === "forgot") {
    return "Forgot password";
  }
  if (mode === "reset") {
    return "Reset password";
  }
  return "Login";
}

function submitLabel(mode: AuthMode): string {
  if (mode === "register") {
    return "Register";
  }
  if (mode === "forgot") {
    return "Request reset";
  }
  if (mode === "reset") {
    return "Reset password";
  }
  return "Login";
}
