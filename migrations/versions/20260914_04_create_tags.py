"""Create tags and flashcard tags tables.

Revision ID: 20260914_04
Revises: 20260914_03
Create Date: 2026-09-14
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260914_04"
down_revision: str | Sequence[str] | None = "20260914_03"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("language_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80, collation="NOCASE"), nullable=False),
        sa.ForeignKeyConstraint(
            ["language_id"],
            ["languages.id"],
            name=op.f("fk_tags_language_id_languages"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_tags")),
    )
    op.create_index(op.f("ix_tags_language_id"), "tags", ["language_id"])
    op.create_table(
        "flashcard_tags",
        sa.Column("flashcard_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["flashcard_id"],
            ["flashcards.id"],
            name=op.f("fk_flashcard_tags_flashcard_id_flashcards"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["tag_id"],
            ["tags.id"],
            name=op.f("fk_flashcard_tags_tag_id_tags"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("flashcard_id", "tag_id", name=op.f("pk_flashcard_tags")),
    )
    op.create_index(op.f("ix_flashcard_tags_tag_id"), "flashcard_tags", ["tag_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_flashcard_tags_tag_id"), table_name="flashcard_tags")
    op.drop_table("flashcard_tags")
    op.drop_index(op.f("ix_tags_language_id"), table_name="tags")
    op.drop_table("tags")
