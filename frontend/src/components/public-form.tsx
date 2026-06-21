"use client";

import { FormEvent, useMemo, useState } from "react";
import { submitFormResponse } from "@/lib/api";
import type { Answers, AnswerValue, FormField, FormRecord } from "@/lib/types";

const controlClassName =
  "min-h-control w-full border border-line bg-[#30333d] px-4 py-3 text-ink outline-none transition placeholder:text-ink-muted/70 hover:border-[#5f6368] focus:border-accent focus:bg-[#333642] focus:shadow-focus";

const primaryButtonClassName =
  "min-h-control border border-accent bg-accent px-6 py-2 font-bold tracking-wide text-ink-button shadow-[0_8px_18px_rgba(161,66,244,0.22)] transition hover:border-accent-hover hover:bg-accent-hover focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-65";

type PublicFormProps = {
  form: FormRecord;
};

export function PublicForm({ form }: PublicFormProps) {
  const schema = form.latest_version.schema;
  const [answers, setAnswers] = useState<Answers>(() => initialAnswers(schema.fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitState, setSubmitState] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const requiredFields = useMemo(
    () => schema.fields.filter((field) => field.required).map((field) => field.id),
    [schema.fields],
  );

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
      setSubmitState("success");
      setSubmitMessage("Response submitted.");
    } catch (error) {
      setSubmitState("error");
      setSubmitMessage(error instanceof Error ? error.message : "Submission failed.");
    }
  }

  return (
    <section className="border border-line bg-panel shadow-panel">
      <header className="border-b border-line bg-panel p-7 max-sm:p-5 flex flex-col items-center">
        <h1 className="m-0 font-display text-[clamp(30px,4vw,46px)] leading-tight text-center">
          {schema.title}
        </h1>

        {schema.description ? (
          <p className="mt-2.5 max-w-[720px] text-center leading-6 text-ink-muted">
            {schema.description}
          </p>
        ) : null}
      </header>

      {!form.accepting_responses ? (
        <div className="border-b border-line bg-[#181a20] p-7 max-sm:p-5">
          <div className="border border-line-error bg-error px-4 py-4">
            This form is not accepting responses.
          </div>
        </div>
      ) : null}

      <form onSubmit={submit}>
        <div className="grid gap-4 bg-[#181a20] p-7 max-sm:p-5">
          {submitMessage ? (
            <div
              className={
                submitState === "success"
                  ? "border border-line-success bg-success px-4 py-4"
                  : "border border-line-error bg-error px-4 py-4"
              }
            >
              {submitMessage}
            </div>
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
          <button
            className={primaryButtonClassName}
            disabled={submitState === "submitting" || !form.accepting_responses}
            type="submit"
          >
            {submitState === "submitting" ? "Submitting" : "Submit response"}
          </button>
        </div>
      </form>
    </section>
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
    <div className="grid gap-3 border border-line bg-panel p-5 shadow-[0_1px_0_rgba(255,255,255,0.02)]">
      <label className="text-base font-semibold leading-tight" htmlFor={field.id}>
        {field.label} {field.required ? <span className="text-danger">*</span> : null}
      </label>
      {field.description ? (
        <p className="m-0 text-sm text-ink-muted" id={`${field.id}-description`}>
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
        <textarea
          aria-describedby={describedBy}
          className={`${controlClassName} min-h-[120px] resize-y`}
          id={field.id}
          placeholder={field.placeholder ?? undefined}
          value={stringValue(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "number":
      return (
        <input
          aria-describedby={describedBy}
          className={controlClassName}
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
        <input
          aria-describedby={describedBy}
          className={controlClassName}
          id={field.id}
          placeholder={field.placeholder ?? undefined}
          type={field.type === "phone" ? "tel" : field.type}
          value={stringValue(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    case "select":
      return (
        <select
          aria-describedby={describedBy}
          className={controlClassName}
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
        </select>
      );
    case "radio":
      return (
        <div aria-describedby={describedBy} className="grid gap-2" role="radiogroup">
          {(field.options ?? []).map((option) => {
            const checked = value === option.value;
            return (
              <label
                className={`flex min-h-11 items-center gap-3 border px-4 py-2 transition hover:border-accent hover:bg-[#333642] ${
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
                {option.label}
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
                className={`flex min-h-11 items-center gap-3 border px-4 py-2 transition hover:border-accent hover:bg-[#333642] ${
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
                {option.label}
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
              className="h-rating w-rating border border-line bg-[#30333d] font-display text-lg font-bold text-ink transition hover:border-accent hover:bg-[#333642] aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-ink-button"
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
