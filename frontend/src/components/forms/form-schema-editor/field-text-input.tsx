import { compactInputClassName } from "@/components/forms/form-schema-editor/styles";

type FieldTextInputProps = {
  disabled?: boolean;
  label: string;
  maxLength?: number;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function FieldTextInput({
  disabled = false,
  label,
  maxLength,
  required = false,
  value,
  onChange,
}: FieldTextInputProps) {
  const id = `field-${label.toLowerCase().replaceAll(" ", "-")}`;

  return (
    <div>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <input
        className={`${compactInputClassName} mt-2 disabled:cursor-not-allowed disabled:opacity-55`}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
