import type { FormField, FormSchema } from "@/lib/types";
import { fieldIdPattern, optionFieldTypes } from "@/components/forms/form-schema-editor/constants";

export type FormValidation = {
  formErrors: string[];
  fieldErrors: Record<number, string[]>;
  optionErrors: Record<string, string[]>;
  rangeErrors: Record<number, string[]>;
};

export function validateSchema(schema: FormSchema): FormValidation {
  const validation: FormValidation = {
    formErrors: [],
    fieldErrors: {},
    optionErrors: {},
    rangeErrors: {},
  };

  if (schema.title.trim().length === 0) {
    validation.formErrors.push("Title is required.");
  }

  if (schema.title.length > 200) {
    validation.formErrors.push("Title must be 200 characters or fewer.");
  }

  if ((schema.description?.length ?? 0) > 1000) {
    validation.formErrors.push("Description must be 1000 characters or fewer.");
  }

  if (schema.fields.length === 0) {
    validation.formErrors.push("A form must have at least one field.");
  }

  if (schema.fields.length > 100) {
    validation.formErrors.push("A form can have at most 100 fields.");
  }

  const fieldIdCounts = countValues(schema.fields.map((field) => field.id));

  schema.fields.forEach((field, index) => {
    const fieldErrors: string[] = [];
    const rangeErrors: string[] = [];

    if (field.id.trim().length === 0) {
      fieldErrors.push("Field ID is required.");
    } else if (!fieldIdPattern.test(field.id)) {
      fieldErrors.push(
        "Field ID must start with a lowercase letter and use only lowercase letters, numbers, and underscores.",
      );
    }

    if (field.id.length > 64) {
      fieldErrors.push("Field ID must be 64 characters or fewer.");
    }

    if (fieldIdCounts[field.id] > 1) {
      fieldErrors.push("Field ID must be unique.");
    }

    if (field.label.trim().length === 0) {
      fieldErrors.push("Label is required.");
    }

    if (field.label.length > 200) {
      fieldErrors.push("Label must be 200 characters or fewer.");
    }

    if ((field.description?.length ?? 0) > 500) {
      fieldErrors.push("Description must be 500 characters or fewer.");
    }

    if ((field.placeholder?.length ?? 0) > 200) {
      fieldErrors.push("Placeholder must be 200 characters or fewer.");
    }

    if (optionFieldTypes.has(field.type)) {
      validateOptions(field, index, validation, fieldErrors);
    }

    if (field.type === "number") {
      if (
        field.min !== null &&
        field.max !== null &&
        field.min !== undefined &&
        field.max !== undefined &&
        field.min > field.max
      ) {
        rangeErrors.push("Number min cannot be greater than max.");
      }
    }

    if (field.type === "rating") {
      if ((field.min ?? 1) < 1) {
        rangeErrors.push("Rating min must be at least 1.");
      }
      if ((field.max ?? 5) > 10) {
        rangeErrors.push("Rating max must be at most 10.");
      }
      if ((field.min ?? 1) >= (field.max ?? 5)) {
        rangeErrors.push("Rating min must be less than max.");
      }
    }

    if (fieldErrors.length > 0) {
      validation.fieldErrors[index] = fieldErrors;
    }

    if (rangeErrors.length > 0) {
      validation.rangeErrors[index] = rangeErrors;
    }
  });

  return validation;
}

function validateOptions(
  field: FormField,
  fieldIndex: number,
  validation: FormValidation,
  fieldErrors: string[],
) {
  const options = field.options ?? [];

  if (options.length === 0) {
    fieldErrors.push(`${field.type} fields must have at least one option.`);
  }

  if (options.length > 50) {
    fieldErrors.push("Option fields can have at most 50 options.");
  }

  const optionValueCounts = countValues(options.map((option) => option.value));

  options.forEach((option, optionIndex) => {
    const optionErrors: string[] = [];

    if (option.label.trim().length === 0) {
      optionErrors.push("Option label is required.");
    }

    if (option.label.length > 120) {
      optionErrors.push("Option label must be 120 characters or fewer.");
    }

    if (option.value.trim().length === 0) {
      optionErrors.push("Option value is required.");
    }

    if (option.value.length > 120) {
      optionErrors.push("Option value must be 120 characters or fewer.");
    }

    if (optionValueCounts[option.value] > 1) {
      optionErrors.push("Option value must be unique within this field.");
    }

    if (optionErrors.length > 0) {
      validation.optionErrors[`${fieldIndex.toString()}:${optionIndex.toString()}`] = optionErrors;
    }
  });
}

export function hasErrors(validation: FormValidation): boolean {
  return (
    validation.formErrors.length > 0 ||
    Object.values(validation.fieldErrors).some((errors) => errors.length > 0) ||
    Object.values(validation.optionErrors).some((errors) => errors.length > 0) ||
    Object.values(validation.rangeErrors).some((errors) => errors.length > 0)
  );
}

function countValues(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}
