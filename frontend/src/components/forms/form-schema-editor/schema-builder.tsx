"use client";

import type { ReactNode } from "react";
import { FormEvent, useState } from "react";
import type {
  FormField,
  FormReviewSuggestion,
  FormSchema,
  GenerateFormResult,
} from "@/lib/types";
import {
  BuilderFooter,
  BuilderHeader,
  BuilderMessages,
  FieldsSection,
  FieldsEmptyState,
  FormPreview,
  SchemaDetailsSection,
  SchemaPreview,
} from "@/components/forms/form-schema-editor/builder-sections";
import { FieldEditor } from "@/components/forms/form-schema-editor/field-editor";
import { PlusIcon } from "@/components/forms/form-schema-editor/icons";
import { addFieldButtonClassName, surfaceClassName } from "@/components/ui/styles";
import { Button, Card, Panel, TextArea } from "@/components/ui/primitives";
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
  isReviewing?: boolean;
  reviewLabel?: string;
  reviewSuggestions?: FormReviewSuggestion[];
  reviewingLabel?: string;
  saveLabel: string;
  savingLabel: string;
  submitBlocked?: boolean;
  bottomSlot?: ReactNode;
  metadataSlot?: ReactNode;
  onImprove?: (schema: FormSchema, instruction: string) => Promise<GenerateFormResult>;
  onReview?: (schema: FormSchema) => Promise<void>;
  onSave: (schema: FormSchema) => Promise<void>;
};

export function FormSchemaBuilder({
  eyebrow,
  initialSchema,
  message,
  messageKind,
  metrics,
  isReviewing = false,
  reviewLabel,
  reviewSuggestions = [],
  reviewingLabel,
  saveLabel,
  savingLabel,
  submitBlocked = false,
  bottomSlot,
  metadataSlot,
  onImprove,
  onReview,
  onSave,
}: FormSchemaBuilderProps) {
  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [editableFields, setEditableFields] = useState<EditableField[]>(() =>
    editableFieldsFromSchema(initialSchema, "initial"),
  );
  const [improveInstruction, setImproveInstruction] = useState("");
  const [improveError, setImproveError] = useState<string | null>(null);
  const [improveWarnings, setImproveWarnings] = useState<string[]>([]);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const schemaToSave: FormSchema = { ...schema, fields: editableFields.map((item) => item.field) };
  const normalizedSchema = normalizeSchema(schemaToSave);
  const validation = validateSchema(normalizedSchema);
  const hasValidationErrors = hasErrors(validation);
  const reviewSuggestionsByFieldId = groupReviewSuggestionsByFieldId(reviewSuggestions);

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

  async function reviewDraft() {
    if (hasValidationErrors || !onReview) {
      return;
    }

    await onReview(normalizedSchema);
  }

  async function improveDraft() {
    const instruction = improveInstruction.trim();
    if (!instruction) {
      setImproveError("Instruction is required.");
      return;
    }
    if (hasValidationErrors || !onImprove) {
      return;
    }

    setIsImproving(true);
    setImproveError(null);
    try {
      const result = await onImprove(normalizedSchema, instruction);
      setSchema(result.schema);
      setEditableFields(
        editableFieldsFromSchema(result.schema, `improved-${Date.now().toString(36)}`),
      );
      setImproveWarnings(result.warnings);
      setImproveInstruction("");
    } catch (error) {
      setImproveError(error instanceof Error ? error.message : "Failed to improve draft.");
    } finally {
      setIsImproving(false);
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

  function duplicateField(index: number) {
    setEditableFields((current) => {
      const source = current[index];
      if (!source) {
        return current;
      }

      const duplicate = {
        editorKey: `copy-${Date.now().toString(36)}-${index.toString()}`,
        field: {
          ...source.field,
          id: nextDuplicateFieldId(source.field, current.map((item) => item.field)),
          label: `${source.field.label} copy`,
        },
      };

      const nextFields = [...current];
      nextFields.splice(index + 1, 0, duplicate);
      return nextFields;
    });
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
    setEditableFields(editableFieldsFromSchema(initialSchema, "initial"));
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

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] xl:items-start">
            <FieldsSection>
              {editableFields.length === 0 ? <FieldsEmptyState /> : null}
              {editableFields.map(({ editorKey, field }, index) => (
                <FieldEditor
                  field={field}
                  fieldCount={editableFields.length}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === editableFields.length - 1}
                  key={editorKey}
                  errors={validation.fieldErrors[index] ?? []}
                  optionErrors={validation.optionErrors}
                  rangeErrors={validation.rangeErrors[index] ?? []}
                  reviewSuggestions={reviewSuggestionsByFieldId[field.id] ?? []}
                  onChange={(nextField) => updateField(index, nextField)}
                  onDuplicate={() => duplicateField(index)}
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
            <div className="grid gap-5 xl:sticky xl:top-6">
              <FormPreview schema={normalizedSchema} />
              <SchemaPreview schema={normalizedSchema} />
            </div>
          </div>

          {bottomSlot}

          {onImprove && !bottomSlot ? (
            <ImproveDraftSection
              disabled={isImproving || hasValidationErrors}
              error={improveError}
              instruction={improveInstruction}
              isImproving={isImproving}
              warnings={improveWarnings}
              onChange={setImproveInstruction}
              onImprove={() => void improveDraft()}
            />
          ) : null}
        </div>

        <BuilderFooter
          disabled={isSaving || isReviewing || isImproving || hasValidationErrors || submitBlocked}
          isReviewing={isReviewing}
          isSaving={isSaving}
          reviewDisabled={isSaving || isImproving || hasValidationErrors}
          reviewLabel={reviewLabel}
          reviewingLabel={reviewingLabel}
          saveLabel={saveLabel}
          savingLabel={savingLabel}
          onReview={onReview ? reviewDraft : undefined}
          onReset={resetBuilder}
        />
      </form>
    </Panel>
  );
}

function nextFieldId(fields: FormField[]): string {
  return nextFieldIdFromBase("field", fields);
}

function nextDuplicateFieldId(field: FormField, fields: FormField[]): string {
  return nextFieldIdFromBase(`${fieldIdBase(field.id)}_copy`, fields);
}

function nextFieldIdFromBase(base: string, fields: FormField[]): string {
  const existingIds = new Set(fields.map((field) => field.id));
  let index = 1;
  let candidate = base;

  while (existingIds.has(candidate)) {
    index += 1;
    candidate = `${base}_${index.toString()}`;
  }

  return candidate;
}

function fieldIdBase(fieldId: string): string {
  return fieldId.replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || "field";
}

function editableFieldsFromSchema(schema: FormSchema, prefix: string): EditableField[] {
  return schema.fields.map((field, index) => ({
    editorKey: `${prefix}-${index.toString()}-${field.id}`,
    field,
  }));
}

type ImproveDraftSectionProps = {
  disabled: boolean;
  error: string | null;
  instruction: string;
  isImproving: boolean;
  warnings: string[];
  onChange: (instruction: string) => void;
  onImprove: () => void;
};

function ImproveDraftSection({
  disabled,
  error,
  instruction,
  isImproving,
  warnings,
  onChange,
  onImprove,
}: ImproveDraftSectionProps) {
  return (
    <Card asSection className="grid gap-3 p-5">
      <div>
        <label className="text-base font-semibold" htmlFor="form-improve-instruction">
          Improve with prompt
        </label>
        <TextArea
          className="mt-2 min-h-[88px] resize-y"
          id="form-improve-instruction"
          maxLength={8000}
          placeholder="Make this shorter, add a consent question, or make the wording less biased."
          value={instruction}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {error ? <p className="m-0 text-sm text-danger">{error}</p> : null}
      {warnings.length > 0 ? (
        <div className="border border-line bg-[#181a20] px-4 py-3 text-sm text-ink-muted">
          {warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}
      <Button
        className="justify-self-end max-sm:w-full"
        disabled={disabled}
        type="button"
        onClick={onImprove}
      >
        {isImproving ? "Improving" : "Improve draft"}
      </Button>
    </Card>
  );
}

function groupReviewSuggestionsByFieldId(
  suggestions: FormReviewSuggestion[],
): Record<string, FormReviewSuggestion[]> {
  return suggestions.reduce<Record<string, FormReviewSuggestion[]>>((groups, suggestion) => {
    if (!suggestion.field_id) {
      return groups;
    }

    groups[suggestion.field_id] = [...(groups[suggestion.field_id] ?? []), suggestion];
    return groups;
  }, {});
}
