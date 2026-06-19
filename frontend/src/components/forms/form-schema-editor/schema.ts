import type { FormField, FormSchema } from "@/lib/types";
import { optionFieldTypes } from "@/components/forms/form-schema-editor/constants";

export function normalizeSchema(schema: FormSchema): FormSchema {
  return {
    title: schema.title,
    description: schema.description || null,
    fields: schema.fields.map(normalizeFieldForType),
  };
}

export function normalizeFieldForType(field: FormField): FormField {
  const baseField: FormField = {
    id: field.id,
    type: field.type,
    label: field.label,
    required: field.required,
    description: field.description || null,
    placeholder: field.placeholder || null,
  };

  if (optionFieldTypes.has(field.type)) {
    return {
      ...baseField,
      placeholder: null,
      options:
        field.options && field.options.length > 0
          ? field.options
          : [{ label: "Option 1", value: "option_1" }],
    };
  }

  if (field.type === "rating") {
    return {
      ...baseField,
      placeholder: null,
      min: field.min ?? 1,
      max: field.max ?? 5,
    };
  }

  if (field.type === "number") {
    return {
      ...baseField,
      min: field.min ?? null,
      max: field.max ?? null,
    };
  }

  return baseField;
}
