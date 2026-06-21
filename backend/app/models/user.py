from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import DateTime, String

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.form import Form
    from app.models.refresh_token import RefreshToken


def utc_now() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    forms: Mapped[list[Form]] = relationship(back_populates="owner")
    refresh_tokens: Mapped[list[RefreshToken]] = relationship(back_populates="user")
