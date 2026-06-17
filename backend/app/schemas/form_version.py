from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.form import FormSchema


class FormVersionCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    form_schema: FormSchema = Field(validation_alias="schema", serialization_alias="schema")


class FormVersionRead(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: UUID
    form_id: UUID
    version_number: int = Field(ge=1)
    form_schema: FormSchema = Field(validation_alias="schema", serialization_alias="schema")
    created_at: datetime
