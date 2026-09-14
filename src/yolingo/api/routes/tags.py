from fastapi import APIRouter, HTTPException, status

from yolingo.api.dependencies import TagServiceDependency
from yolingo.exceptions import (
    FlashcardNotFoundError,
    InvalidTagNameError,
    LanguageNotFoundError,
    TagAlreadyExistsError,
    TagLanguageMismatchError,
    TagNotFoundError,
)
from yolingo.schemas.tag import FlashcardTagsUpdate, TagCreate, TagResponse

router = APIRouter(tags=["tags"])


def to_http_error(error: Exception) -> HTTPException:
    if isinstance(error, LanguageNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El idioma no existe.")
    if isinstance(error, FlashcardNotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La flashcard no existe.",
        )
    if isinstance(error, TagNotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El tag no existe.")
    if isinstance(error, TagAlreadyExistsError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un tag con ese nombre en el idioma.",
        )
    if isinstance(error, TagLanguageMismatchError):
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El tag pertenece a otro idioma.",
        )
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail="El nombre del tag debe contener entre 1 y 80 caracteres.",
    )


@router.get("/languages/{language_id}/tags", response_model=list[TagResponse])
def list_tags(language_id: int, service: TagServiceDependency) -> list[TagResponse]:
    try:
        tags = service.list_tags(language_id)
    except LanguageNotFoundError as error:
        raise to_http_error(error) from error
    return [TagResponse.model_validate(tag) for tag in tags]


@router.post(
    "/languages/{language_id}/tags",
    response_model=TagResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_tag(
    language_id: int,
    payload: TagCreate,
    service: TagServiceDependency,
) -> TagResponse:
    try:
        tag = service.create_tag(language_id=language_id, name=payload.name)
    except (LanguageNotFoundError, InvalidTagNameError, TagAlreadyExistsError) as error:
        raise to_http_error(error) from error
    return TagResponse.model_validate(tag)


@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int, service: TagServiceDependency) -> None:
    try:
        service.delete_tag(tag_id)
    except TagNotFoundError as error:
        raise to_http_error(error) from error


@router.get("/flashcards/{flashcard_id}/tags", response_model=list[TagResponse])
def get_flashcard_tags(
    flashcard_id: int,
    service: TagServiceDependency,
) -> list[TagResponse]:
    try:
        tags = service.get_flashcard_tags(flashcard_id)
    except FlashcardNotFoundError as error:
        raise to_http_error(error) from error
    return [TagResponse.model_validate(tag) for tag in tags]


@router.put("/flashcards/{flashcard_id}/tags", response_model=list[TagResponse])
def update_flashcard_tags(
    flashcard_id: int,
    payload: FlashcardTagsUpdate,
    service: TagServiceDependency,
) -> list[TagResponse]:
    try:
        tags = service.update_flashcard_tags(
            flashcard_id=flashcard_id,
            tag_ids=payload.tag_ids,
        )
    except (FlashcardNotFoundError, TagNotFoundError, TagLanguageMismatchError) as error:
        raise to_http_error(error) from error
    return [TagResponse.model_validate(tag) for tag in tags]


@router.delete(
    "/flashcards/{flashcard_id}/tags/{tag_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_flashcard_tag(
    flashcard_id: int,
    tag_id: int,
    service: TagServiceDependency,
) -> None:
    try:
        service.remove_tag(flashcard_id=flashcard_id, tag_id=tag_id)
    except (FlashcardNotFoundError, TagNotFoundError, TagLanguageMismatchError) as error:
        raise to_http_error(error) from error
