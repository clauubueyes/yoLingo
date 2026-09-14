from typing import TYPE_CHECKING

from sqlalchemy import Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

from yolingo.database import Base

if TYPE_CHECKING:
    from yolingo.models.flashcard import Flashcard
    from yolingo.models.language import Language


flashcard_tags = Table(
    "flashcard_tags",
    Base.metadata,
    Column(
        "flashcard_id",
        Integer,
        ForeignKey("flashcards.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "tag_id",
        Integer,
        ForeignKey("tags.id", ondelete="CASCADE"),
        primary_key=True,
        index=True,
    ),
)


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True)
    language_id: Mapped[int] = mapped_column(
        ForeignKey("languages.id", ondelete="CASCADE"),
        index=True,
    )
    name: Mapped[str] = mapped_column(String(80, collation="NOCASE"))

    language: Mapped["Language"] = relationship(back_populates="tags")
    flashcards: Mapped[list["Flashcard"]] = relationship(
        secondary=flashcard_tags,
        back_populates="tags",
    )
