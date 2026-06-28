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
import { ArrowDownIcon, ArrowUpIcon, TrashIcon } from "@/components/forms/form-schema-editor/icons";
import {
  dangerIconButtonClassName,
  iconButtonClassName,
} from "@/components/forms/form-schema-editor/styles";
import { SelectInput } from "@/components/ui/primitives";

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
    <article className="grid min-w-0 gap-4 border border-line bg-panel p-5 max-sm:p-4">
      <div className="flex items-center justify-between gap-4 border-b border-line pb-4 max-sm:flex-col max-sm:items-stretch">
        <div className="min-w-0">
          <div className="font-display text-xl">Field {index + 1}</div>
          <div className="mt-1 break-all text-sm text-ink-muted">{field.id || "unnamed_field"}</div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button
            aria-label="Move field up"
            className={iconButtonClassName}
            disabled={isFirst}
            title="Move field up"
            type="button"
            onClick={() => onMove(-1)}
          >
            <ArrowUpIcon />
          </button>
          <button
            aria-label="Move field down"
            className={iconButtonClassName}
            disabled={isLast}
            title="Move field down"
            type="button"
            onClick={() => onMove(1)}
          >
            <ArrowDownIcon />
          </button>
          <button
            aria-label="Remove field"
            className={dangerIconButtonClassName}
            title="Remove field"
            type="button"
            onClick={onRemove}
          >
            <TrashIcon />
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
          <SelectInput
            compact
            className="mt-2"
            id={`${field.id}-type`}
            value={field.type}
            onChange={(event) => updateType(event.target.value as FieldType)}
          >
            {fieldTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectInput>
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
