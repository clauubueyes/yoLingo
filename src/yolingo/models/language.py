from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from yolingo.database import Base

if TYPE_CHECKING:
    from yolingo.models.category import Category


class Language(Base):
    __tablename__ = "languages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80, collation="NOCASE"), unique=True, index=True)
    code: Mapped[str] = mapped_column(String(35), unique=True, index=True)
    flag: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.current_timestamp())
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )
    categories: Mapped[list["Category"]] = relationship(
        back_populates="language",
        cascade="all, delete-orphan",
    )
