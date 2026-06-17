from __future__ import annotations

import re
from enum import StrEnum
from typing import Any, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

MAX_FIELD_COUNT = 100
MAX_OPTIONS_PER_FIELD = 50
MAX_FIELD_ID_LENGTH = 64

FIELD_ID_PATTERN = re.compile(r"^[a-z][a-z0-9_]*$")


class FieldType(StrEnum):
    TEXT = "text"
    TEXTAREA = "textarea"
    NUMBER = "number"
    EMAIL = "email"
    PHONE = "phone"
    DATE = "date"
    SELECT = "select"
    RADIO = "radio"
    CHECKBOX = "checkbox"
    RATING = "rating"


class FieldOption(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    label: str = Field(min_length=1, max_length=120)
    value: str = Field(min_length=1, max_length=120)


class FormField(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    id: str = Field(min_length=1, max_length=MAX_FIELD_ID_LENGTH)
    type: FieldType
    label: str = Field(min_length=1, max_length=200)
    required: bool = False
    description: str | None = Field(default=None, max_length=500)
    placeholder: str | None = Field(default=None, max_length=200)
    options: list[FieldOption] | None = Field(default=None, max_length=MAX_OPTIONS_PER_FIELD)
    min: int | float | None = None
    max: int | float | None = None

    @field_validator("id")
    @classmethod
    def validate_id(cls, value: str) -> str:
        if not FIELD_ID_PATTERN.fullmatch(value):
            raise ValueError(
                "field id must start with a lowercase letter and contain only lowercase "
                "letters, numbers, and underscores"
            )
        return value

    @model_validator(mode="after")
    def validate_field_rules(self) -> Self:
        option_types = {FieldType.SELECT, FieldType.RADIO, FieldType.CHECKBOX}

        if self.type in option_types:
            if not self.options:
                raise ValueError(f"{self.type} fields must define at least one option")
            option_values = [option.value for option in self.options]
            if len(option_values) != len(set(option_values)):
                raise ValueError("field option values must be unique")
        elif self.options:
            raise ValueError(f"{self.type} fields cannot define options")

        if self.type == FieldType.RATING:
            min_value = 1 if self.min is None else self.min
            max_value = 5 if self.max is None else self.max
            if min_value < 1:
                raise ValueError("rating min must be at least 1")
            if max_value > 10:
                raise ValueError("rating max must be at most 10")
            if min_value >= max_value:
                raise ValueError("rating min must be less than rating max")
            self.min = min_value
            self.max = max_value
        elif self.type == FieldType.NUMBER:
            if self.min is not None and self.max is not None and self.min > self.max:
                raise ValueError("number min cannot be greater than number max")
        elif self.min is not None or self.max is not None:
            raise ValueError(f"{self.type} fields cannot define min or max")

        return self


class FormSchema(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    fields: list[FormField] = Field(min_length=1, max_length=MAX_FIELD_COUNT)

    @model_validator(mode="before")
    @classmethod
    def reject_nested_schema(cls, data: Any) -> Any:
        if not isinstance(data, dict):
            return data

        for field in data.get("fields", []):
            if isinstance(field, dict) and "fields" in field:
                raise ValueError("nested fields are not supported")

        return data

    @model_validator(mode="after")
    def validate_unique_field_ids(self) -> Self:
        field_ids = [field.id for field in self.fields]
        if len(field_ids) != len(set(field_ids)):
            raise ValueError("field ids must be unique")
        return self
