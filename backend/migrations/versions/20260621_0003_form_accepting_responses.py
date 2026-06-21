"""Add accepting responses setting to forms.

Revision ID: 20260621_0003
Revises: 20260620_0002
Create Date: 2026-06-21
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260621_0003"
down_revision: str | None = "20260620_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "forms",
        sa.Column(
            "accepting_responses",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true(),
        ),
    )


def downgrade() -> None:
    op.drop_column("forms", "accepting_responses")
