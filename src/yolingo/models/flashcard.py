from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from yolingo.database import Base

if TYPE_CHECKING:
    from yolingo.models.category import Category
    from yolingo.models.language import Language


class Flashcard(Base):
    __tablename__ = "flashcards"

    id: Mapped[int] = mapped_column(primary_key=True)
    language_id: Mapped[int] = mapped_column(
        ForeignKey("languages.id", ondelete="CASCADE"),
        index=True,
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        index=True,
    )
    term: Mapped[str] = mapped_column(Text)
    translation: Mapped[str] = mapped_column(Text)
    example: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    language: Mapped["Language"] = relationship(back_populates="flashcards")
    category: Mapped["Category"] = relationship(back_populates="flashcards")
