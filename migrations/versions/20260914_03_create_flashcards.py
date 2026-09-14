"""Create flashcards table.

Revision ID: 20260914_03
Revises: 20260914_02
Create Date: 2026-09-14
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260914_03"
down_revision: str | Sequence[str] | None = "20260914_02"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "flashcards",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("language_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("term", sa.Text(), nullable=False),
        sa.Column("translation", sa.Text(), nullable=False),
        sa.Column("example", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
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
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["categories.id"],
            name=op.f("fk_flashcards_category_id_categories"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["language_id"],
            ["languages.id"],
            name=op.f("fk_flashcards_language_id_languages"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_flashcards")),
    )
    op.create_index(op.f("ix_flashcards_category_id"), "flashcards", ["category_id"])
    op.create_index(op.f("ix_flashcards_language_id"), "flashcards", ["language_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_flashcards_language_id"), table_name="flashcards")
    op.drop_index(op.f("ix_flashcards_category_id"), table_name="flashcards")
    op.drop_table("flashcards")
