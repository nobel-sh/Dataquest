import type { FieldOption, FormField } from "@/lib/types";
import { ErrorList } from "@/components/forms/form-schema-editor/shared";
import {
  compactInputClassName,
  secondaryButtonClassName,
} from "@/components/forms/form-schema-editor/styles";

type OptionsEditorProps = {
  field: FormField;
  fieldIndex: number;
  optionErrors: Record<string, string[]>;
  onChange: (field: FormField) => void;
};

export function OptionsEditor({
  field,
  fieldIndex,
  optionErrors,
  onChange,
}: OptionsEditorProps) {
  const options = field.options ?? [];

  function updateOption(index: number, nextOption: FieldOption) {
    onChange({
      ...field,
      options: options.map((option, optionIndex) =>
        optionIndex === index ? nextOption : option,
      ),
    });
  }

  function addOption() {
    const nextNumber = options.length + 1;
    onChange({
      ...field,
      options: [
        ...options,
        {
          label: `Option ${nextNumber.toString()}`,
          value: `option_${nextNumber.toString()}`,
        },
      ],
    });
  }

  function removeOption(index: number) {
    onChange({
      ...field,
      options: options.filter((_, optionIndex) => optionIndex !== index),
    });
  }

  return (
    <section className="grid gap-3 border border-line bg-[#181a20] p-4">
      <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
        <div className="font-semibold">Options</div>
        <button className={secondaryButtonClassName} type="button" onClick={addOption}>
          Add option
        </button>
      </div>

      {options.map((option, index) => (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 max-sm:grid-cols-1" key={index}>
          <input
            aria-label={`Option ${index + 1} label`}
            className={compactInputClassName}
            placeholder="Label"
            value={option.label}
            onChange={(event) => updateOption(index, { ...option, label: event.target.value })}
          />
          <input
            aria-label={`Option ${index + 1} value`}
            className={compactInputClassName}
            placeholder="value"
            value={option.value}
            onChange={(event) => updateOption(index, { ...option, value: event.target.value })}
          />
          <button
            className="min-h-control border border-line-error bg-error px-4 py-2 text-sm font-semibold text-ink transition hover:border-danger disabled:cursor-not-allowed disabled:opacity-50"
            disabled={options.length <= 1}
            type="button"
            onClick={() => removeOption(index)}
          >
            Remove
          </button>
          {optionErrors[`${fieldIndex.toString()}:${index.toString()}`]?.length ? (
            <div className="col-span-3 max-sm:col-span-1">
              <ErrorList errors={optionErrors[`${fieldIndex.toString()}:${index.toString()}`]} />
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
