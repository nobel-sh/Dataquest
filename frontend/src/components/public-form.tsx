"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getFormBySlug, submitFormResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { surfaceClassName } from "@/components/ui/styles";
import { Alert, Button, Panel } from "@/components/ui/primitives";
import {
  compactAnswers,
  initialAnswers,
  validateRequiredAnswers,
} from "@/components/public-form/answer-utils";
import { PublicFormField } from "@/components/public-form/field-control";
import type { Answers, AnswerValue, FormRecord, User } from "@/lib/types";

type PublicFormProps = {
  form: FormRecord;
};

export function PublicForm({ form }: PublicFormProps) {
  const schema = form.latest_version.schema;
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(schema.fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasResponded, setHasResponded] = useState(form.has_responded);
  const [isCheckingSession, setIsCheckingSession] = useState(form.requires_login);
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const requiredFields = useMemo(
    () => schema.fields.filter((field) => field.required).map((field) => field.id),
    [schema.fields],
  );
  const loginRequired = form.requires_login && !currentUser;
  const duplicateBlocked = hasResponded;

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const user = await getCurrentUser();
        const latestForm = user ? await getFormBySlug(form.slug) : null;
        if (!cancelled) {
          setCurrentUser(user);
          setHasResponded(latestForm?.has_responded ?? false);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingSession(false);
        }
      }
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, [form.requires_login, form.slug]);

  function setAnswer(fieldId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [fieldId]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[fieldId];
      return next;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.accepting_responses) {
      setSubmitState("error");
      setSubmitMessage("This form is not accepting responses.");
      return;
    }
    if (loginRequired) {
      setSubmitState("error");
      setSubmitMessage("Login is required to submit this form.");
      return;
    }
    if (duplicateBlocked) {
      setSubmitState("error");
      setSubmitMessage("You have already submitted a response to this form.");
      return;
    }

    const nextErrors = validateRequiredAnswers(requiredFields, answers);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmitState("error");
      setSubmitMessage("Complete the required fields before submitting.");
      return;
    }

    setSubmitState("submitting");
    setSubmitMessage(null);

    try {
      await submitFormResponse(form.id, compactAnswers(answers));
      setHasResponded(true);
      setSubmitState("success");
      setSubmitMessage("Response submitted.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <Panel>
      <header className="flex flex-col items-center border-b border-line bg-panel p-7 max-sm:p-5">
        <h1 className="m-0 max-w-full break-words text-center font-display text-[clamp(30px,4vw,46px)] leading-tight">
          {schema.title}
        </h1>

        {schema.description ? (
          <p className="mt-2.5 max-w-[720px] break-words text-center leading-6 text-ink-muted">
            {schema.description}
          </p>
        ) : null}
      </header>

      {form.requires_login ? (
        <div className={`border-b border-line ${surfaceClassName} p-7 max-sm:p-5`}>
          <div className="border border-line bg-panel px-4 py-4">
            {isCheckingSession ? (
              "Checking login..."
            ) : currentUser ? (
              <span>
                Submitting as {currentUser.email}
                {hasResponded ? "; you have already responded." : "."}
              </span>
            ) : (
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <span>Login is required to submit this form.</span>
                <Link
                  className="border border-accent bg-accent px-4 py-2 text-center font-bold tracking-wide text-ink-button transition hover:border-accent-hover hover:bg-accent-hover"
                  href="/auth"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {!form.accepting_responses ? (
        <div className={`border-b border-line ${surfaceClassName} p-7 max-sm:p-5`}>
          <Alert>
            This form is not accepting responses.
          </Alert>
        </div>
      ) : null}

      {duplicateBlocked ? (
        <div className={`border-b border-line ${surfaceClassName} p-7 max-sm:p-5`}>
          <Alert>
            You have already submitted a response to this form.
          </Alert>
        </div>
      ) : null}

      <form onSubmit={submit}>
        <div className={`grid gap-4 ${surfaceClassName} p-7 max-sm:p-5`}>
          {submitMessage ? (
            <Alert tone={submitState === "success" ? "success" : "error"}>
              {submitMessage}
            </Alert>
          ) : null}

          {schema.fields.map((field) => (
            <PublicFormField
              key={field.id}
              field={field}
              value={answers[field.id]}
              error={errors[field.id]}
              onChange={(value) => setAnswer(field.id, value)}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-line bg-panel px-7 py-5 max-sm:flex-col max-sm:items-stretch max-sm:p-5">
          <Button
            variant="primaryLarge"
            disabled={
              submitState === "submitting" ||
              !form.accepting_responses ||
              isCheckingSession ||
              loginRequired ||
              duplicateBlocked
            }
            type="submit"
          >
            {submitState === "submitting" ? "Submitting" : "Submit response"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
