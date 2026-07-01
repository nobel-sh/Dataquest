import { TextInput } from "@/components/ui/primitives";

type FieldTextInputProps = {
  disabled?: boolean;
  id?: string;
  label: string;
  maxLength?: number;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function FieldTextInput({
  disabled = false,
  id,
  label,
  maxLength,
  required = false,
  value,
  onChange,
}: FieldTextInputProps) {
  const inputId = id ?? `field-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={inputId}>
        {label}
      </label>
      <TextInput
        compact
        className="mt-2 disabled:cursor-not-allowed disabled:opacity-55"
        disabled={disabled}
        id={inputId}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
