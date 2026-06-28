import type { FieldOption, FormField } from "@/lib/types";
import { PlusIcon, TrashIcon } from "@/components/forms/form-schema-editor/icons";
import { ErrorList } from "@/components/forms/form-schema-editor/shared";
import {
  dangerIconButtonClassName,
  iconButtonClassName,
} from "@/components/forms/form-schema-editor/styles";
import { TextInput } from "@/components/ui/primitives";

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
        <button
          aria-label="Add option"
          className={iconButtonClassName}
          title="Add option"
          type="button"
          onClick={addOption}
        >
          <PlusIcon />
        </button>
      </div>

      {options.map((option, index) => (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 max-sm:grid-cols-1" key={index}>
          <TextInput
            aria-label={`Option ${index + 1} label`}
            compact
            placeholder="Label"
            value={option.label}
            onChange={(event) => updateOption(index, { ...option, label: event.target.value })}
          />
          <TextInput
            aria-label={`Option ${index + 1} value`}
            compact
            placeholder="value"
            value={option.value}
            onChange={(event) => updateOption(index, { ...option, value: event.target.value })}
          />
          <button
            aria-label={`Remove option ${index + 1}`}
            className={dangerIconButtonClassName}
            disabled={options.length <= 1}
            title="Remove option"
            type="button"
            onClick={() => removeOption(index)}
          >
            <TrashIcon />
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
