from __future__ import annotations

from enum import StrEnum
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.form import FormSchema

MAX_PROMPT_LENGTH = 8000
MAX_AGENT_WARNINGS = 20
MAX_REVIEW_SUGGESTIONS = 50


class ReviewSeverity(StrEnum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"


class GenerateFormRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    prompt: str = Field(min_length=1, max_length=MAX_PROMPT_LENGTH)


class GenerateFormResult(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    form_schema: FormSchema = Field(validation_alias="schema", serialization_alias="schema")
    warnings: list[str] = Field(default_factory=list, max_length=MAX_AGENT_WARNINGS)


class FormReviewSuggestion(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    field_id: str | None = None
    severity: ReviewSeverity
    message: str = Field(min_length=1, max_length=500)


class FormReviewResult(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    form_schema: FormSchema = Field(validation_alias="schema", serialization_alias="schema")
    suggestions: list[FormReviewSuggestion] = Field(
        default_factory=list,
        max_length=MAX_REVIEW_SUGGESTIONS,
    )

    @model_validator(mode="after")
    def validate_suggestion_field_ids(self) -> Self:
        field_ids = {field.id for field in self.form_schema.fields}

        for suggestion in self.suggestions:
            if suggestion.field_id is not None and suggestion.field_id not in field_ids:
                raise ValueError(f"suggestion references unknown field id: {suggestion.field_id}")

        return self
