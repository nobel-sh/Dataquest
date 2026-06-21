"""Add login-required forms and response respondents.

Revision ID: 20260621_0005
Revises: 20260621_0004
Create Date: 2026-06-21
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260621_0005"
down_revision: str | None = "20260621_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "forms",
        sa.Column(
            "requires_login",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )
    op.add_column("responses", sa.Column("respondent_user_id", sa.Uuid(), nullable=True))
    op.create_index(op.f("ix_responses_respondent_user_id"), "responses", ["respondent_user_id"])
    if op.get_bind().dialect.name != "sqlite":
        op.create_foreign_key(
            "fk_responses_respondent_user_id_users",
            "responses",
            "users",
            ["respondent_user_id"],
            ["id"],
            ondelete="SET NULL",
        )


def downgrade() -> None:
    if op.get_bind().dialect.name != "sqlite":
        op.drop_constraint(
            "fk_responses_respondent_user_id_users",
            "responses",
            type_="foreignkey",
        )
    op.drop_index(op.f("ix_responses_respondent_user_id"), table_name="responses")
    op.drop_column("responses", "respondent_user_id")
    op.drop_column("forms", "requires_login")
