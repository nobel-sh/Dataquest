import type { ReactNode } from "react";
import { ResetIcon } from "@/components/forms/form-schema-editor/icons";
import { ErrorList, Metric } from "@/components/forms/form-schema-editor/shared";
import type { BuilderMetric } from "@/components/forms/form-schema-editor/schema-builder";
import { iconButtonClassName, primaryButtonLargeClassName } from "@/components/ui/styles";
import { Alert, Card, TextArea, TextInput } from "@/components/ui/primitives";
import type { FormSchema } from "@/lib/types";

type BuilderHeaderProps = {
  eyebrow: string;
  metrics: BuilderMetric[];
  title: string;
};

export function BuilderHeader({ eyebrow, metrics, title }: BuilderHeaderProps) {
  return (
    <header className="border-b border-line p-7 max-sm:p-5">
      <p className="m-0 text-sm uppercase text-ink-muted">{eyebrow}</p>
      <h1 className="m-0 mt-2 break-words font-display text-[clamp(30px,4vw,46px)] leading-tight">
        {title}
      </h1>
      <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
        {metrics.map((metric) => (
          <Metric key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </div>
    </header>
  );
}

type BuilderMessagesProps = {
  formErrors: string[];
  message: string | null;
  messageKind: "error" | "success";
};

export function BuilderMessages({ formErrors, message, messageKind }: BuilderMessagesProps) {
  return (
    <>
      {message ? (
        <Alert tone={messageKind === "success" ? "success" : "error"}>
          {message}
        </Alert>
      ) : null}

      {formErrors.length > 0 ? <ErrorList errors={formErrors} /> : null}
    </>
  );
}

type SchemaDetailsSectionProps = {
  schema: FormSchema;
  onChange: (schema: FormSchema) => void;
};

export function SchemaDetailsSection({ schema, onChange }: SchemaDetailsSectionProps) {
  return (
    <Card asSection className="grid min-w-0 gap-4 p-5 max-sm:p-4">
      <div className="min-w-0">
        <label className="text-base font-semibold" htmlFor="form-title">
          Title
        </label>
        <TextInput
          className="mt-2"
          id="form-title"
          maxLength={200}
          required
          value={schema.title}
          onChange={(event) => onChange({ ...schema, title: event.target.value })}
        />
        {schema.title.trim().length === 0 ? (
          <p className="m-0 mt-2 text-sm text-danger">Title is required.</p>
        ) : null}
      </div>

      <div>
        <label className="text-base font-semibold" htmlFor="form-description">
          Description
        </label>
        <TextArea
          className="mt-2 min-h-[96px] resize-y"
          id="form-description"
          maxLength={1000}
          value={schema.description ?? ""}
          onChange={(event) =>
            onChange({
              ...schema,
              description: event.target.value || null,
            })
          }
        />
      </div>
    </Card>
  );
}

export function SchemaPreview({ schema }: { schema: FormSchema }) {
  return (
    <details className="min-w-0 max-w-full border border-line bg-panel">
      <summary className="cursor-pointer px-5 py-4 font-semibold">Schema preview</summary>
      <pre className="m-0 max-w-full overflow-x-auto whitespace-pre border-t border-line bg-[#181a20] p-5 text-sm leading-6 text-ink-muted max-sm:p-4">
        {JSON.stringify(schema, null, 2)}
      </pre>
    </details>
  );
}

type BuilderFooterProps = {
  disabled: boolean;
  isSaving: boolean;
  saveLabel: string;
  savingLabel: string;
  onReset: () => void;
};

export function BuilderFooter({
  disabled,
  isSaving,
  saveLabel,
  savingLabel,
  onReset,
}: BuilderFooterProps) {
  return (
    <div className="grid gap-3 border-t border-line bg-panel px-7 py-5 sm:grid-cols-[auto_1fr] sm:items-center max-sm:p-5">
      <button
        aria-label="Reset form editor"
        className={`${iconButtonClassName} max-sm:w-full`}
        title="Reset form editor"
        type="button"
        onClick={onReset}
      >
        <ResetIcon />
      </button>
      <button
        className={`${primaryButtonLargeClassName} sm:justify-self-end`}
        disabled={disabled}
        type="submit"
      >
        {isSaving ? savingLabel : saveLabel}
      </button>
    </div>
  );
}

export function FieldsSection({ children }: { children: ReactNode }) {
  return (
    <section className="grid gap-4">
      <div>
        <div>
          <h2 className="m-0 font-display text-2xl">Fields</h2>
          <p className="m-0 mt-1 text-sm text-ink-muted">
            Save creates a version. Existing responses stay linked to their original version.
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}
