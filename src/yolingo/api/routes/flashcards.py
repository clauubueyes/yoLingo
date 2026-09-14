from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from yolingo.api.dependencies import FlashcardServiceDependency, TagServiceDependency
from yolingo.exceptions import (
    CategoryLanguageMismatchError,
    CategoryNotFoundError,
    FlashcardAlreadyExistsError,
    FlashcardNotFoundError,
    InvalidFlashcardTermError,
    InvalidFlashcardTranslationError,
    LanguageNotFoundError,
    TagLanguageMismatchError,
    TagNotFoundError,
)
from yolingo.schemas.flashcard import FlashcardCreate, FlashcardResponse, FlashcardUpdate
from yolingo.schemas.tag import TagId

router = APIRouter(tags=["flashcards"])

CATEGORY_ERRORS = (
    LanguageNotFoundError,
    CategoryNotFoundError,
    CategoryLanguageMismatchError,
)
WRITE_ERRORS = (
    FlashcardAlreadyExistsError,
    InvalidFlashcardTermError,
    InvalidFlashcardTranslationError,
)
FILTER_ERRORS = (*CATEGORY_ERRORS, TagNotFoundError, TagLanguageMismatchError)


def to_http_error(error: Exception) -> HTTPException:
    if isinstance(error, LanguageNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El idioma no existe.")
    if isinstance(error, CategoryNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría no existe.",
        )
    if isinstance(error, CategoryLanguageMismatchError):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La categoría pertenece a otro idioma.",
        )
    if isinstance(error, FlashcardNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La flashcard no existe.",
        )
    if isinstance(error, FlashcardAlreadyExistsError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una flashcard con ese término y traducción en la categoría.",
        )
    if isinstance(error, TagNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El tag no existe.")
    if isinstance(error, TagLanguageMismatchError):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El tag pertenece a otro idioma.",
        )
    if isinstance(error, InvalidFlashcardTermError):
        detail = "El término no puede estar vacío."
    else:
        detail = "La traducción no puede estar vacía."
    return HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=detail)


@router.get(
    "/languages/{language_id}/categories/{category_id}/flashcards",
    response_model=list[FlashcardResponse],
)
def list_flashcards(
    language_id: int,
    category_id: int,
    service: TagServiceDependency,
    search: str | None = None,
    tag_ids: Annotated[list[TagId] | None, Query()] = None,
) -> list[FlashcardResponse]:
    try:
        flashcards = service.filter_flashcards(
            language_id=language_id,
            category_id=category_id,
            search=search,
            tag_ids=tag_ids,
        )
    except FILTER_ERRORS as error:
        raise to_http_error(error) from error
    return [FlashcardResponse.model_validate(flashcard) for flashcard in flashcards]


@router.post(
    "/languages/{language_id}/categories/{category_id}/flashcards",
    response_model=FlashcardResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_flashcard(
    language_id: int,
    category_id: int,
    payload: FlashcardCreate,
    service: FlashcardServiceDependency,
) -> FlashcardResponse:
    try:
        flashcard = service.create_flashcard(
            language_id=language_id,
            category_id=category_id,
            term=payload.term,
            translation=payload.translation,
            example=payload.example,
            notes=payload.notes,
        )
    except (*CATEGORY_ERRORS, *WRITE_ERRORS) as error:
        raise to_http_error(error) from error
    return FlashcardResponse.model_validate(flashcard)


@router.get("/flashcards/{flashcard_id}", response_model=FlashcardResponse)
def get_flashcard(
    flashcard_id: int,
    service: FlashcardServiceDependency,
) -> FlashcardResponse:
    try:
        flashcard = service.get_flashcard(flashcard_id)
    except FlashcardNotFoundError as error:
        raise to_http_error(error) from error
    return FlashcardResponse.model_validate(flashcard)


@router.patch("/flashcards/{flashcard_id}", response_model=FlashcardResponse)
def update_flashcard(
    flashcard_id: int,
    payload: FlashcardUpdate,
    service: FlashcardServiceDependency,
) -> FlashcardResponse:
    try:
        current = service.get_flashcard(flashcard_id)
        fields = payload.model_fields_set
        flashcard = service.update_flashcard(
            flashcard_id,
            term=payload.term if "term" in fields else current.term,
            translation=(
                payload.translation if "translation" in fields else current.translation
            ),
            example=payload.example if "example" in fields else current.example,
            notes=payload.notes if "notes" in fields else current.notes,
        )
    except (FlashcardNotFoundError, *WRITE_ERRORS) as error:
        raise to_http_error(error) from error
    return FlashcardResponse.model_validate(flashcard)


@router.delete("/flashcards/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_flashcard(
    flashcard_id: int,
    service: FlashcardServiceDependency,
) -> None:
    try:
        service.delete_flashcard(flashcard_id)
    except FlashcardNotFoundError as error:
        raise to_http_error(error) from error
