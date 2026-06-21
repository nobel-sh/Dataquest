"""Add refresh token session family.

Revision ID: 20260621_0007
Revises: 20260621_0006
Create Date: 2026-06-21
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260621_0007"
down_revision: str | None = "20260621_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("refresh_tokens", sa.Column("session_id", sa.Uuid(), nullable=True))
    op.execute("UPDATE refresh_tokens SET session_id = id")
    with op.batch_alter_table("refresh_tokens") as batch_op:
        batch_op.alter_column("session_id", nullable=False)
    op.create_index(
        op.f("ix_refresh_tokens_session_id"),
        "refresh_tokens",
        ["session_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_refresh_tokens_session_id"), table_name="refresh_tokens")
    op.drop_column("refresh_tokens", "session_id")
