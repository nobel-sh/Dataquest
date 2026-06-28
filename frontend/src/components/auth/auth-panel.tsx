"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, register } from "@/lib/auth";
import {
  surfaceClassName,
} from "@/components/ui/styles";
import { Alert, Button, Panel, TextInput } from "@/components/ui/primitives";

export function AuthPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      await (mode === "login" ? login(email, password) : register(email, password));
      router.push("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Panel className="mx-auto w-full max-w-[620px]">
      <header className="border-b border-line p-7 max-sm:p-5">
        <p className="m-0 text-sm uppercase text-ink-muted">Account</p>
        <h1 className="m-0 mt-2 font-display text-[clamp(30px,4vw,46px)] leading-tight">
          {mode === "login" ? "Login" : "Register"}
        </h1>
      </header>

      <form onSubmit={submit}>
        <div className={`grid gap-5 ${surfaceClassName} p-7 max-sm:p-5`}>
          {message ? (
            <Alert>{message}</Alert>
          ) : null}
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
          <div>
            <label className="text-base font-semibold" htmlFor="password">
              Password
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
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-panel px-7 py-5 max-sm:flex-col max-sm:items-stretch max-sm:p-5">
          <Button
            variant="secondary"
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Create account" : "Use login"}
          </Button>
          <Button variant="primaryLarge" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving" : mode === "login" ? "Login" : "Register"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
