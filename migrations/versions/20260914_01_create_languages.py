"""Create languages table.

Revision ID: 20260914_01
Revises:
Create Date: 2026-09-14
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260914_01"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "languages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80, collation="NOCASE"), nullable=False),
        sa.Column("code", sa.String(length=35), nullable=False),
        sa.Column("flag", sa.String(length=16), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_languages")),
    )
    op.create_index(op.f("ix_languages_code"), "languages", ["code"], unique=True)
    op.create_index(op.f("ix_languages_name"), "languages", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_languages_name"), table_name="languages")
    op.drop_index(op.f("ix_languages_code"), table_name="languages")
    op.drop_table("languages")
