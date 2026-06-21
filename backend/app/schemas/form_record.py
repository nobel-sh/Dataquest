from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.form import FormSchema
from app.schemas.form_version import FormVersionRead


class FormCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True, str_strip_whitespace=True)

    slug: str = Field(min_length=1, max_length=120, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    form_schema: FormSchema = Field(validation_alias="schema", serialization_alias="schema")


class FormSettingsUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    accepting_responses: bool


class FormRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    title: str
    description: str | None
    slug: str
    accepting_responses: bool
    created_at: datetime
    updated_at: datetime
    latest_version: FormVersionRead
