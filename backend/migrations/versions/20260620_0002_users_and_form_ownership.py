"""Add users and form ownership.

Revision ID: 20260620_0002
Revises: 20260619_0001
Create Date: 2026-06-20
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260620_0002"
down_revision: str | None = "20260619_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=256), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.add_column("forms", sa.Column("owner_id", sa.Uuid(), nullable=True))
    op.create_index(op.f("ix_forms_owner_id"), "forms", ["owner_id"])
    if op.get_bind().dialect.name != "sqlite":
        op.create_foreign_key(
            "fk_forms_owner_id_users",
            "forms",
            "users",
            ["owner_id"],
            ["id"],
            ondelete="CASCADE",
        )


def downgrade() -> None:
    if op.get_bind().dialect.name != "sqlite":
        op.drop_constraint("fk_forms_owner_id_users", "forms", type_="foreignkey")
    op.drop_index(op.f("ix_forms_owner_id"), table_name="forms")
    op.drop_column("forms", "owner_id")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
