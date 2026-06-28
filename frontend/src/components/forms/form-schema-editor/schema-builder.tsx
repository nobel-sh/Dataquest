"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import type { FormField, FormSchema } from "@/lib/types";
import { FieldEditor } from "@/components/forms/form-schema-editor/field-editor";
import { PlusIcon, ResetIcon } from "@/components/forms/form-schema-editor/icons";
import { ErrorList, Metric } from "@/components/forms/form-schema-editor/shared";
import {
  addFieldButtonClassName,
  iconButtonClassName,
  primaryButtonLargeClassName,
  surfaceClassName,
} from "@/components/ui/styles";
import { Alert, Card, Panel, TextArea, TextInput } from "@/components/ui/primitives";
import { normalizeSchema } from "@/components/forms/form-schema-editor/schema";
import { hasErrors, validateSchema } from "@/components/forms/form-schema-editor/validation";

export type BuilderMetric = {
  label: string;
  value: string;
};

type EditableField = {
  editorKey: string;
  field: FormField;
};

type FormSchemaBuilderProps = {
  eyebrow: string;
  initialSchema: FormSchema;
  message: string | null;
  messageKind: "error" | "success";
  metrics: BuilderMetric[];
  saveLabel: string;
  savingLabel: string;
  submitBlocked?: boolean;
  metadataSlot?: ReactNode;
  onSave: (schema: FormSchema) => Promise<void>;
};

export function FormSchemaBuilder({
  eyebrow,
  initialSchema,
  message,
  messageKind,
  metrics,
  saveLabel,
  savingLabel,
  submitBlocked = false,
  metadataSlot,
  onSave,
}: FormSchemaBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [editableFields, setEditableFields] = useState<EditableField[]>(() =>
    initialSchema.fields.map((field, index) => ({
      editorKey: `initial-${index.toString()}-${field.id}`,
      field,
    })),
  );
  const [isSaving, setIsSaving] = useState(false);
  const schemaToSave: FormSchema = { ...schema, fields: editableFields.map((item) => item.field) };
  const normalizedSchema = normalizeSchema(schemaToSave);
  const validation = validateSchema(normalizedSchema);
  const hasValidationErrors = hasErrors(validation);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (hasValidationErrors || submitBlocked) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave(normalizedSchema);
    } finally {
      setIsSaving(false);
    }
  }

  function updateField(index: number, nextField: FormField) {
    setEditableFields((current) =>
      current.map((item, fieldIndex) =>
        fieldIndex === index ? { ...item, field: nextField } : item,
      ),
    );
  }

  function addField() {
    setEditableFields((current) => [
      ...current,
      {
        editorKey: `new-${Date.now().toString(36)}-${current.length.toString()}`,
        field: {
          id: nextFieldId(current.map((item) => item.field)),
          type: "text",
          label: "New question",
          required: false,
        },
      },
    ]);
  }

  function removeField(index: number) {
    setEditableFields((current) => current.filter((_, fieldIndex) => fieldIndex !== index));
  }

  function moveField(index: number, direction: -1 | 1) {
    setEditableFields((current) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const nextFields = [...current];
      const [item] = nextFields.splice(index, 1);
      nextFields.splice(nextIndex, 0, item);
      return nextFields;
    });
  }

  function resetBuilder() {
    setSchema(initialSchema);
    setEditableFields(
      initialSchema.fields.map((field, index) => ({
        editorKey: `initial-${index.toString()}-${field.id}`,
        field,
      })),
    );
  }

  return (
    <Panel>
      <header className="border-b border-line p-7 max-sm:p-5">
        <p className="m-0 text-sm uppercase text-ink-muted">{eyebrow}</p>
        <h1 className="m-0 mt-2 break-words font-display text-[clamp(30px,4vw,46px)] leading-tight">
          {schema.title || initialSchema.title}
        </h1>
        <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
          {metrics.map((metric) => (
            <Metric key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </div>
      </header>

      <form onSubmit={save}>
        <div className={`grid gap-5 ${surfaceClassName} p-7 max-sm:p-5`}>
          {message ? (
            <Alert tone={messageKind === "success" ? "success" : "error"}>
              {message}
            </Alert>
          ) : null}

          {validation.formErrors.length > 0 ? <ErrorList errors={validation.formErrors} /> : null}

          {metadataSlot}

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
                onChange={(event) =>
                  setSchema((current) => ({ ...current, title: event.target.value }))
                }
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
                  setSchema((current) => ({
                    ...current,
                    description: event.target.value || null,
                  }))
                }
              />
            </div>
          </Card>

          <section className="grid gap-4">
            <div>
              <div>
                <h2 className="m-0 font-display text-2xl">Fields</h2>
                <p className="m-0 mt-1 text-sm text-ink-muted">
                  Save creates a version. Existing responses stay linked to their original version.
                </p>
              </div>
            </div>

            {editableFields.map(({ editorKey, field }, index) => (
              <FieldEditor
                field={field}
                index={index}
                isFirst={index === 0}
                isLast={index === editableFields.length - 1}
                key={editorKey}
                errors={validation.fieldErrors[index] ?? []}
                optionErrors={validation.optionErrors}
                rangeErrors={validation.rangeErrors[index] ?? []}
                onChange={(nextField) => updateField(index, nextField)}
                onMove={(direction) => moveField(index, direction)}
                onRemove={() => removeField(index)}
              />
            ))}

            <button
              aria-label="Add field"
              className={`${addFieldButtonClassName} justify-self-center`}
              title="Add field"
              type="button"
              onClick={addField}
            >
              <PlusIcon className="size-6" />
            </button>
          </section>

          <details className="min-w-0 max-w-full border border-line bg-panel">
            <summary className="cursor-pointer px-5 py-4 font-semibold">Schema preview</summary>
            <pre className="m-0 max-w-full overflow-x-auto whitespace-pre border-t border-line bg-[#181a20] p-5 text-sm leading-6 text-ink-muted max-sm:p-4">
              {JSON.stringify(normalizedSchema, null, 2)}
            </pre>
          </details>
        </div>

        <div className="grid gap-3 border-t border-line bg-panel px-7 py-5 sm:grid-cols-[auto_1fr] sm:items-center max-sm:p-5">
          <button
            aria-label="Reset form editor"
            className={`${iconButtonClassName} max-sm:w-full`}
            title="Reset form editor"
            type="button"
            onClick={resetBuilder}
          >
            <ResetIcon />
          </button>
          <button
            className={`${primaryButtonLargeClassName} sm:justify-self-end`}
            disabled={isSaving || hasValidationErrors || submitBlocked}
            type="submit"
          >
            {isSaving ? savingLabel : saveLabel}
          </button>
        </div>
      </form>
    </Panel>
  );
}

function nextFieldId(fields: FormField[]): string {
  const existingIds = new Set(fields.map((field) => field.id));
  let index = fields.length + 1;
  let candidate = `field_${index.toString()}`;

  while (existingIds.has(candidate)) {
    index += 1;
    candidate = `field_${index.toString()}`;
  }

  return candidate;
}
