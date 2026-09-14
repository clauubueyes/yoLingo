from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class LanguageCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    code: str = Field(
        min_length=2,
        max_length=35,
        pattern=r"^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$",
    )
    flag: str | None = Field(default=None, max_length=16)

    @field_validator("name")
    @classmethod
    def strip_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("El nombre no puede estar vacío.")
        return stripped

    @field_validator("flag")
    @classmethod
    def strip_flag(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class LanguageResponse(BaseModel):
    id: int
    name: str
    code: str
    flag: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
