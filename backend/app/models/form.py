from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

from sqlalchemy import ForeignKey, Index, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON, DateTime, Integer, String

from app.db.base import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


class Form(Base):
    __tablename__ = "forms"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(String(1000), default=None)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    versions: Mapped[list[FormVersion]] = relationship(
        back_populates="form",
        cascade="all, delete-orphan",
    )
    responses: Mapped[list[FormResponse]] = relationship(
        back_populates="form",
        cascade="all, delete-orphan",
    )


class FormVersion(Base):
    __tablename__ = "form_versions"
    __table_args__ = (
        UniqueConstraint("form_id", "version_number", name="uq_form_versions_form_version"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    form_id: Mapped[UUID] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), index=True)
    version_number: Mapped[int] = mapped_column(Integer)
    schema_json: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    form: Mapped[Form] = relationship(back_populates="versions")
    responses: Mapped[list[FormResponse]] = relationship(back_populates="form_version")


class FormResponse(Base):
    __tablename__ = "responses"
    __table_args__ = (
        Index("ix_responses_form_version_id", "form_version_id"),
    )

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    form_id: Mapped[UUID] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), index=True)
    form_version_id: Mapped[UUID] = mapped_column(
        ForeignKey("form_versions.id", ondelete="RESTRICT"),
    )
    answers_json: Mapped[dict[str, Any]] = mapped_column(JSON)
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    form: Mapped[Form] = relationship(back_populates="responses")
    form_version: Mapped[FormVersion] = relationship(back_populates="responses")
