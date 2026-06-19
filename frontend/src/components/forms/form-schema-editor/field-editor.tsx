import type { FieldType, FormField } from "@/lib/types";
import {
  fieldTypes,
  optionFieldTypes,
  rangedFieldTypes,
} from "@/components/forms/form-schema-editor/constants";
import { FieldTextInput } from "@/components/forms/form-schema-editor/field-text-input";
import { OptionsEditor } from "@/components/forms/form-schema-editor/options-editor";
import { RangeEditor } from "@/components/forms/form-schema-editor/range-editor";
import { normalizeFieldForType } from "@/components/forms/form-schema-editor/schema";
import { ErrorList } from "@/components/forms/form-schema-editor/shared";
import {
  compactInputClassName,
  secondaryButtonClassName,
} from "@/components/forms/form-schema-editor/styles";

type FieldEditorProps = {
  errors: string[];
  field: FormField;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  optionErrors: Record<string, string[]>;
  rangeErrors: string[];
  onChange: (field: FormField) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
};

export function FieldEditor({
  errors,
  field,
  index,
  isFirst,
  isLast,
  optionErrors,
  rangeErrors,
  onChange,
  onMove,
  onRemove,
}: FieldEditorProps) {
  const hasOptions = optionFieldTypes.has(field.type);
  const hasRange = rangedFieldTypes.has(field.type);

  function updateType(type: FieldType) {
    onChange(normalizeFieldForType({ ...field, type }));
  }

  return (
    <article className="grid gap-4 border border-line bg-panel p-5">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4 max-sm:flex-col max-sm:items-stretch">
        <div>
          <div className="font-display text-xl">Field {index + 1}</div>
          <div className="mt-1 text-sm text-ink-muted">{field.id || "unnamed_field"}</div>
        </div>
        <div className="flex gap-2 max-sm:grid max-sm:grid-cols-3">
          <button
            className={secondaryButtonClassName}
            disabled={isFirst}
            type="button"
            onClick={() => onMove(-1)}
          >
            Up
          </button>
          <button
            className={secondaryButtonClassName}
            disabled={isLast}
            type="button"
            onClick={() => onMove(1)}
          >
            Down
          </button>
          <button
            className="min-h-control border border-line-error bg-error px-4 py-2 font-semibold text-ink transition hover:border-danger disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>

      {errors.length > 0 ? <ErrorList errors={errors} /> : null}

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <FieldTextInput
          label="Field ID"
          value={field.id}
          onChange={(value) => onChange({ ...field, id: value })}
        />
        <div>
          <label className="text-sm font-semibold" htmlFor={`${field.id}-type`}>
            Type
          </label>
          <select
            className={`${compactInputClassName} mt-2`}
            id={`${field.id}-type`}
            value={field.type}
            onChange={(event) => updateType(event.target.value as FieldType)}
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FieldTextInput
        label="Label"
        maxLength={200}
        required
        value={field.label}
        onChange={(value) => onChange({ ...field, label: value })}
      />

      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <FieldTextInput
          label="Description"
          value={field.description ?? ""}
          onChange={(value) => onChange({ ...field, description: value || null })}
        />
        <FieldTextInput
          label="Placeholder"
          disabled={field.type === "rating" || hasOptions}
          value={field.placeholder ?? ""}
          onChange={(value) => onChange({ ...field, placeholder: value || null })}
        />
      </div>

      <label className="flex min-h-control items-center gap-3 border border-line bg-[#30333d] px-4 py-2">
        <input
          checked={field.required}
          type="checkbox"
          onChange={(event) => onChange({ ...field, required: event.target.checked })}
        />
        <span>Required</span>
      </label>

      {hasOptions ? (
        <OptionsEditor
          field={field}
          fieldIndex={index}
          optionErrors={optionErrors}
          onChange={onChange}
        />
      ) : null}
      {hasRange ? (
        <RangeEditor field={field} rangeErrors={rangeErrors} onChange={onChange} />
      ) : null}
    </article>
  );
}
