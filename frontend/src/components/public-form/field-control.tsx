import { ratingButtonClassName } from "@/components/ui/styles";
import { SelectInput, TextArea, TextInput } from "@/components/ui/primitives";
import type { AnswerValue, FormField } from "@/lib/types";
import { stringValue } from "@/components/public-form/answer-utils";

type PublicFormFieldProps = {
  error?: string;
  field: FormField;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
};

export function PublicFormField({ error, field, value, onChange }: PublicFormFieldProps) {
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
  describedBy?: string;
  field: FormField;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
};

function FieldInput({ describedBy, field, value, onChange }: FieldInputProps) {
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
      return <OptionGroup describedBy={describedBy} field={field} value={value} onChange={onChange} />;
    case "checkbox":
      return (
        <OptionGroup
          describedBy={describedBy}
          field={field}
          value={value}
          multiple
          onChange={onChange}
        />
      );
    case "rating":
      return <RatingInput describedBy={describedBy} field={field} value={value} onChange={onChange} />;
  }
}

function OptionGroup({
  describedBy,
  field,
  multiple = false,
  value,
  onChange,
}: {
  describedBy?: string;
  field: FormField;
  multiple?: boolean;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
  const selectedValues = Array.isArray(value) ? value : [];

  return (
    <div
      aria-describedby={describedBy}
      className="grid gap-2"
      role={multiple ? undefined : "radiogroup"}
    >
      {(field.options ?? []).map((option) => {
        const checked = multiple ? selectedValues.includes(option.value) : value === option.value;
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
              name={multiple ? undefined : field.id}
              type={multiple ? "checkbox" : "radio"}
              value={option.value}
              onChange={(event) => {
                if (!multiple) {
                  onChange(option.value);
                } else if (event.target.checked) {
                  onChange([...selectedValues, option.value]);
                } else {
                  onChange(selectedValues.filter((item) => item !== option.value));
                }
              }}
            />
            <OptionMarker checked={checked} multiple={multiple} />
            <span className="min-w-0 break-words">{option.label}</span>
          </label>
        );
      })}
    </div>
  );
}

function OptionMarker({ checked, multiple }: { checked: boolean; multiple: boolean }) {
  return (
    <span
      className={`grid size-5 place-items-center border-2 ${
        checked ? "border-accent bg-accent" : "border-[#5f6368] bg-[#202124]"
      } ${multiple ? "text-sm font-black leading-none text-ink-button" : ""}`}
    >
      {multiple ? (
        <span className={checked ? "opacity-100" : "opacity-0"}>✓</span>
      ) : (
        <span className={`size-2 bg-ink-button ${checked ? "opacity-100" : "opacity-0"}`} />
      )}
    </span>
  );
}

function RatingInput({
  describedBy,
  field,
  value,
  onChange,
}: {
  describedBy?: string;
  field: FormField;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
}) {
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

function range(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, index) => min + index);
}
