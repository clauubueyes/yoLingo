from datetime import datetime
from typing import Self

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

from yolingo.schemas.tag import TagResponse


class FlashcardContent(BaseModel):
    term: str
    translation: str
    example: str | None = None
    notes: str | None = None

    @field_validator("term", "translation")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("El texto no puede estar vacío.")
        return stripped

    @field_validator("example", "notes")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class FlashcardCreate(FlashcardContent):
    pass


class FlashcardUpdate(BaseModel):
    term: str | None = None
    translation: str | None = None
    example: str | None = None
    notes: str | None = None

    @field_validator("term", "translation")
    @classmethod
    def strip_required_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        if not stripped:
            raise ValueError("El texto no puede estar vacío.")
        return stripped

    @field_validator("example", "notes")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None

    @model_validator(mode="after")
    def validate_patch(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("Debes indicar al menos un campo para actualizar.")
        for field_name in ("term", "translation"):
            if field_name in self.model_fields_set and getattr(self, field_name) is None:
                raise ValueError(f"{field_name} no puede ser nulo.")
        return self


class FlashcardResponse(FlashcardContent):
    id: int
    language_id: int
    category_id: int
    created_at: datetime
    updated_at: datetime
    tags: list[TagResponse]

    model_config = ConfigDict(from_attributes=True)


class StudyFlashcardResponse(FlashcardContent):
    model_config = ConfigDict(from_attributes=True)
