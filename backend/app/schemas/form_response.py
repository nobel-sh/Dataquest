from __future__ import annotations

import re
from datetime import date, datetime
from re import Pattern
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.form import FieldType, FormField, FormSchema

type AnswerValue = str | int | float | bool | list[str] | None

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class FormResponseCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    form_id: UUID
    form_version_id: UUID
    answers: dict[str, AnswerValue] = Field(default_factory=dict)


class FormResponseRead(FormResponseCreate):
    id: UUID
    submitted_at: datetime


class FormResponseSubmit(BaseModel):
    model_config = ConfigDict(extra="forbid")

    answers: dict[str, AnswerValue] = Field(default_factory=dict)


class FormResponseSubmission(BaseModel):
    model_config = ConfigDict(extra="forbid")

    form_schema: FormSchema = Field(validation_alias="schema", serialization_alias="schema")
    answers: dict[str, AnswerValue] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_answers_against_schema(self) -> FormResponseSubmission:
        self.answers = validate_response_answers(self.form_schema, self.answers)
        return self


def validate_response_answers(
    schema: FormSchema,
    answers: dict[str, AnswerValue],
) -> dict[str, AnswerValue]:
    fields_by_id = {field.id: field for field in schema.fields}

    unknown_field_ids = set(answers) - set(fields_by_id)
    if unknown_field_ids:
        unknown = ", ".join(sorted(unknown_field_ids))
        raise ValueError(f"answers contain unknown field ids: {unknown}")

    normalized_answers: dict[str, AnswerValue] = {}

    for field in schema.fields:
        value = answers.get(field.id)

        if is_empty_answer(value):
            if field.required:
                raise ValueError(f"{field.id} is required")
            continue

        normalized_answers[field.id] = validate_answer_value(field, value)

    return normalized_answers


def validate_answer_value(field: FormField, value: AnswerValue) -> AnswerValue:
    match field.type:
        case FieldType.TEXT | FieldType.TEXTAREA | FieldType.PHONE:
            return validate_string(field, value)
        case FieldType.EMAIL:
            return validate_string_pattern(field, value, EMAIL_PATTERN, "email")
        case FieldType.DATE:
            text_value = validate_string(field, value)
            try:
                date.fromisoformat(text_value)
            except ValueError as error:
                raise ValueError(f"{field.id} must be an ISO date string") from error
            return text_value
        case FieldType.NUMBER:
            return validate_number(field, value)
        case FieldType.RATING:
            return validate_number(field, value)
        case FieldType.SELECT | FieldType.RADIO:
            text_value = validate_string(field, value)
            validate_option_value(field, text_value)
            return text_value
        case FieldType.CHECKBOX:
            if not isinstance(value, list):
                raise ValueError(f"{field.id} must be a list of option values")
            for item in value:
                if not isinstance(item, str):
                    raise ValueError(f"{field.id} must contain only string option values")
                validate_option_value(field, item)
            return value


def validate_string(field: FormField, value: AnswerValue) -> str:
    if not isinstance(value, str):
        raise ValueError(f"{field.id} must be a string")
    return value


def validate_string_pattern(
    field: FormField,
    value: AnswerValue,
    pattern: Pattern[str],
    format_name: str,
) -> str:
    text_value = validate_string(field, value)
    if not pattern.fullmatch(text_value):
        raise ValueError(f"{field.id} must be a valid {format_name}")
    return text_value


def validate_number(field: FormField, value: AnswerValue) -> int | float:
    if isinstance(value, bool) or not isinstance(value, int | float):
        raise ValueError(f"{field.id} must be a number")
    if field.min is not None and value < field.min:
        raise ValueError(f"{field.id} must be greater than or equal to {field.min}")
    if field.max is not None and value > field.max:
        raise ValueError(f"{field.id} must be less than or equal to {field.max}")
    return value


def validate_option_value(field: FormField, value: str) -> None:
    allowed_values = {option.value for option in field.options or []}
    if value not in allowed_values:
        raise ValueError(f"{field.id} must be one of: {', '.join(sorted(allowed_values))}")


def is_empty_answer(value: AnswerValue) -> bool:
    return value is None or value == "" or value == []
