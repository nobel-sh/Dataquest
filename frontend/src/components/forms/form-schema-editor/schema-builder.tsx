"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import type { FormField, FormSchema } from "@/lib/types";
import {
  BuilderFooter,
  BuilderHeader,
  BuilderMessages,
  FieldsSection,
  SchemaDetailsSection,
  SchemaPreview,
} from "@/components/forms/form-schema-editor/builder-sections";
import { FieldEditor } from "@/components/forms/form-schema-editor/field-editor";
import { PlusIcon } from "@/components/forms/form-schema-editor/icons";
import { addFieldButtonClassName, surfaceClassName } from "@/components/ui/styles";
import { Panel } from "@/components/ui/primitives";
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
      <BuilderHeader eyebrow={eyebrow} metrics={metrics} title={schema.title || initialSchema.title} />

      <form onSubmit={save}>
        <div className={`grid gap-5 ${surfaceClassName} p-7 max-sm:p-5`}>
          <BuilderMessages
            formErrors={validation.formErrors}
            message={message}
            messageKind={messageKind}
          />

          {metadataSlot}

          <SchemaDetailsSection schema={schema} onChange={setSchema} />

          <FieldsSection>
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
          </FieldsSection>

          <SchemaPreview schema={normalizedSchema} />
        </div>

        <BuilderFooter
          disabled={isSaving || hasValidationErrors || submitBlocked}
          isSaving={isSaving}
          saveLabel={saveLabel}
          savingLabel={savingLabel}
          onReset={resetBuilder}
        />
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
