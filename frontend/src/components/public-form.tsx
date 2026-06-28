"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { getFormBySlug, submitFormResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import {
  ratingButtonClassName,
  surfaceClassName,
} from "@/components/ui/styles";
import { Alert, Button, Panel, SelectInput, TextArea, TextInput } from "@/components/ui/primitives";
import type { Answers, AnswerValue, FormField, FormRecord, User } from "@/lib/types";

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
            <FormFieldControl
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

type FormFieldControlProps = {
  field: FormField;
  value: AnswerValue;
  error?: string;
  onChange: (value: AnswerValue) => void;
};

function FormFieldControl({ field, value, error, onChange }: FormFieldControlProps) {
  const describedBy = [
    field.description ? `${field.id}-description` : null,
    error ? `${field.id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid min-w-0 gap-3 border border-line bg-panel p-5 shadow-[0_1px_0_rgba(255,255,255,0.02)] max-sm:p-4">
      <label className="break-words text-base font-semibold leading-tight" htmlFor={field.id}>
        {field.label} {field.required ? <span className="text-danger">*</span> : null}
      </label>
      {field.description ? (
        <p className="m-0 break-words text-sm text-ink-muted" id={`${field.id}-description`}>
          {field.description}
        </p>
      ) : null}
      <FieldInput
        field={field}
        value={value}
        describedBy={describedBy || undefined}
        onChange={onChange}
      />
      {error ? (
        <p className="m-0 text-sm text-danger" id={`${field.id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type FieldInputProps = {
  field: FormField;
  value: AnswerValue;
  describedBy?: string;
  onChange: (value: AnswerValue) => void;
};

function FieldInput({ field, value, describedBy, onChange }: FieldInputProps) {
  switch (field.type) {
    case "textarea":
      return (
        <TextArea
          aria-describedby={describedBy}
          className="min-h-[120px] resize-y"
          id={field.id}
          placeholder={field.placeholder ?? undefined}
          value={stringValue(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "number":
      return (
        <TextInput
          aria-describedby={describedBy}
          id={field.id}
          max={field.max ?? undefined}
          min={field.min ?? undefined}
          placeholder={field.placeholder ?? undefined}
          type="number"
          value={stringValue(value)}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : Number(event.target.value))
          }
        />
      );
    case "email":
    case "phone":
    case "date":
    case "text":
      return (
        <TextInput
          aria-describedby={describedBy}
          id={field.id}
          placeholder={field.placeholder ?? undefined}
          type={field.type === "phone" ? "tel" : field.type}
          value={stringValue(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "select":
      return (
        <SelectInput
          aria-describedby={describedBy}
          id={field.id}
          value={stringValue(value)}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select an option</option>
          {(field.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectInput>
      );
    case "radio":
      return (
        <div aria-describedby={describedBy} className="grid gap-2" role="radiogroup">
          {(field.options ?? []).map((option) => {
            const checked = value === option.value;
            return (
              <label
                className={`flex min-h-11 min-w-0 items-center gap-3 border px-4 py-2 transition hover:border-accent hover:bg-[#333642] ${
                  checked ? "border-accent bg-[#30213b]" : "border-line bg-[#30333d]"
                }`}
                key={option.value}
              >
                <input
                  className="sr-only"
                  checked={checked}
                  name={field.id}
                  type="radio"
                  value={option.value}
                  onChange={() => onChange(option.value)}
                />
                <span
                  className={`grid size-5 place-items-center border-2 ${
                    checked ? "border-accent bg-accent" : "border-[#5f6368] bg-[#202124]"
                  }`}
                >
                  <span
                    className={`size-2 bg-ink-button ${checked ? "opacity-100" : "opacity-0"}`}
                  />
                </span>
                <span className="min-w-0 break-words">{option.label}</span>
              </label>
            );
          })}
        </div>
      );
    case "checkbox":
      return (
        <div aria-describedby={describedBy} className="grid gap-2">
          {(field.options ?? []).map((option) => {
            const selectedValues = Array.isArray(value) ? value : [];
            const checked = selectedValues.includes(option.value);
            return (
              <label
                className={`flex min-h-11 min-w-0 items-center gap-3 border px-4 py-2 transition hover:border-accent hover:bg-[#333642] ${
                  checked ? "border-accent bg-[#30213b]" : "border-line bg-[#30333d]"
                }`}
                key={option.value}
              >
                <input
                  className="sr-only"
                  checked={checked}
                  type="checkbox"
                  value={option.value}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selectedValues, option.value]);
                    } else {
                      onChange(selectedValues.filter((item) => item !== option.value));
                    }
                  }}
                />
                <span
                  className={`grid size-5 place-items-center border-2 text-sm font-black leading-none text-ink-button ${
                    checked ? "border-accent bg-accent" : "border-[#5f6368] bg-[#202124]"
                  }`}
                >
                  <span className={checked ? "opacity-100" : "opacity-0"}>✓</span>
                </span>
                <span className="min-w-0 break-words">{option.label}</span>
              </label>
            );
          })}
        </div>
      );
    case "rating": {
      const min = field.min ?? 1;
      const max = field.max ?? 5;
      return (
        <div aria-describedby={describedBy} className="flex flex-wrap gap-2">
          {range(min, max).map((rating) => (
            <button
              aria-pressed={value === rating}
              className={ratingButtonClassName}
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
            >
              {rating}
            </button>
          ))}
        </div>
      );
    }
  }
}

function initialAnswers(fields: FormField[]): Answers {
  return Object.fromEntries(
    fields.map((field) => [field.id, field.type === "checkbox" ? [] : ""]),
  );
}

function validateRequiredAnswers(requiredFields: string[], answers: Answers): Record<string, string> {
  return Object.fromEntries(
    requiredFields
      .filter((fieldId) => isEmptyAnswer(answers[fieldId]))
      .map((fieldId) => [fieldId, "This field is required."]),
  );
}

function compactAnswers(answers: Answers): Answers {
  return Object.fromEntries(
    Object.entries(answers).filter(([, value]) => !isEmptyAnswer(value)),
  );
}

function isEmptyAnswer(value: AnswerValue): boolean {
  return value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function stringValue(value: AnswerValue): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}
