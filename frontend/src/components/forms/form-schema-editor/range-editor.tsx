import type { FormField } from "@/lib/types";
import { ErrorList } from "@/components/forms/form-schema-editor/shared";
import { compactInputClassName } from "@/components/forms/form-schema-editor/styles";

type RangeEditorProps = {
  field: FormField;
  rangeErrors: string[];
  onChange: (field: FormField) => void;
};

export function RangeEditor({ field, rangeErrors, onChange }: RangeEditorProps) {
  return (
    <section className="grid gap-4 border border-line bg-[#181a20] p-4">
      {rangeErrors.length > 0 ? <ErrorList errors={rangeErrors} /> : null}
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <NumberInput
          label="Min"
          value={field.min}
          onChange={(value) => onChange({ ...field, min: value })}
        />
        <NumberInput
          label="Max"
          value={field.max}
          onChange={(value) => onChange({ ...field, max: value })}
        />
      </div>
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
}) {
  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={`range-${label.toLowerCase()}`}>
        {label}
      </label>
      <input
        className={`${compactInputClassName} mt-2`}
        id={`range-${label.toLowerCase()}`}
        type="number"
        value={value ?? ""}
        onChange={(event) =>
          onChange(event.target.value === "" ? null : Number(event.target.value))
        }
      />
    </div>
  );
}
