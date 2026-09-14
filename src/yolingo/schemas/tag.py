from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

TagId = Annotated[int, Field(gt=0)]


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("El nombre no puede estar vacío.")
        return stripped


class TagResponse(BaseModel):
    id: int
    language_id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class FlashcardTagsUpdate(BaseModel):
    tag_ids: list[TagId]
