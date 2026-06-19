"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createFormVersion } from "@/lib/api";
import type { FormField, FormRecord, FormSchema } from "@/lib/types";
import { FieldEditor } from "@/components/forms/form-schema-editor/field-editor";
import { ErrorList, Metric } from "@/components/forms/form-schema-editor/shared";
import {
  primaryButtonClassName,
  inputClassName,
  secondaryButtonClassName,
} from "@/components/forms/form-schema-editor/styles";
import { normalizeSchema } from "@/components/forms/form-schema-editor/schema";
import { hasErrors, validateSchema } from "@/components/forms/form-schema-editor/validation";

type FormSchemaEditorProps = {
  form: FormRecord;
};

type EditableField = {
  editorKey: string;
  field: FormField;
};

export function FormSchemaEditor({ form }: FormSchemaEditorProps) {
  const router = useRouter();
  const [schema, setSchema] = useState<FormSchema>(form.latest_version.schema);
  const [editableFields, setEditableFields] = useState<EditableField[]>(() =>
    form.latest_version.schema.fields.map((field, index) => ({
      editorKey: `initial-${index.toString()}-${field.id}`,
      field,
    })),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"error" | "success">("success");
  const schemaToSave: FormSchema = { ...schema, fields: editableFields.map((item) => item.field) };
  const normalizedSchema = normalizeSchema(schemaToSave);
  const validation = validateSchema(normalizedSchema);
  const hasValidationErrors = hasErrors(validation);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    if (hasValidationErrors) {
      setMessageKind("error");
      setMessage("Fix the highlighted schema issues before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const updatedForm = await createFormVersion(form.id, normalizedSchema);
      setMessageKind("success");
      setMessage(`Saved v${updatedForm.latest_version.version_number.toString()}.`);
      router.refresh();
      router.push(`/forms/${updatedForm.slug}`);
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Failed to save form version.");
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

  function resetEditor() {
    setSchema(form.latest_version.schema);
    setEditableFields(
      form.latest_version.schema.fields.map((field, index) => ({
        editorKey: `initial-${index.toString()}-${field.id}`,
        field,
      })),
    );
  }

  return (
    <section className="border border-line bg-panel shadow-panel">
      <header className="border-b border-line p-7 max-sm:p-5">
        <p className="m-0 text-sm uppercase text-ink-muted">Form editor</p>
        <h1 className="m-0 mt-2 font-display text-[clamp(30px,4vw,46px)] leading-tight">
          {schema.title || form.title}
        </h1>
        <div className="mt-4 grid grid-cols-3 border border-line text-sm max-sm:grid-cols-1">
          <Metric label="Current version" value={`v${form.latest_version.version_number}`} />
          <Metric label="Fields" value={editableFields.length.toString()} />
          <Metric label="Slug" value={form.slug} />
        </div>
      </header>

      <form onSubmit={save}>
        <div className="grid gap-5 bg-[#181a20] p-7 max-sm:p-5">
          {message ? (
            <div
              className={
                messageKind === "success"
                  ? "border border-line-success bg-success px-4 py-4"
                  : "border border-line-error bg-error px-4 py-4"
              }
            >
              {message}
            </div>
          ) : null}

          {validation.formErrors.length > 0 ? <ErrorList errors={validation.formErrors} /> : null}

          <section className="grid gap-4 border border-line bg-panel p-5">
            <div>
              <label className="text-base font-semibold" htmlFor="form-title">
                Title
              </label>
              <input
                className={`${inputClassName} mt-2`}
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
              <textarea
                className={`${inputClassName} mt-2 min-h-[96px] resize-y`}
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
          </section>

          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
              <div>
                <h2 className="m-0 font-display text-2xl">Fields</h2>
                <p className="m-0 mt-1 text-sm text-ink-muted">
                  Save creates a new version. Existing responses stay linked to their original
                  version.
                </p>
              </div>
              <button className={secondaryButtonClassName} type="button" onClick={addField}>
                Add field
              </button>
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
          </section>

          <details className="border border-line bg-panel">
            <summary className="cursor-pointer px-5 py-4 font-semibold">Schema preview</summary>
            <pre className="m-0 overflow-x-auto border-t border-line bg-[#181a20] p-5 text-sm leading-6 text-ink-muted">
              {JSON.stringify(normalizedSchema, null, 2)}
            </pre>
          </details>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-panel px-7 py-5 max-sm:flex-col max-sm:items-stretch max-sm:p-5">
          <button className={secondaryButtonClassName} type="button" onClick={resetEditor}>
            Reset
          </button>
          <button
            className={primaryButtonClassName}
            disabled={isSaving || hasValidationErrors}
            type="submit"
          >
            {isSaving ? "Saving" : "Save new version"}
          </button>
        </div>
      </form>
    </section>
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
