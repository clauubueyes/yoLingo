from fastapi import APIRouter, HTTPException, status

from yolingo.api.dependencies import CategoryServiceDependency
from yolingo.exceptions import (
    CategoryAlreadyExistsError,
    CategoryNestingLimitError,
    CategoryNotFoundError,
    CategoryParentLanguageMismatchError,
    InvalidCategoryNameError,
    LanguageNotFoundError,
)
from yolingo.schemas.category import CategoryCreate, CategoryResponse

router = APIRouter(prefix="/languages/{language_id}/categories", tags=["categories"])


@router.get("", response_model=list[CategoryResponse])
def list_categories(
    language_id: int,
    service: CategoryServiceDependency,
) -> list[CategoryResponse]:
    try:
        categories = service.list_categories(language_id)
    except LanguageNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El idioma no existe.",
        ) from error
    return [CategoryResponse.model_validate(category) for category in categories]


@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    language_id: int,
    payload: CategoryCreate,
    service: CategoryServiceDependency,
) -> CategoryResponse:
    try:
        category = service.create_category(
            language_id=language_id,
            name=payload.name,
            parent_id=payload.parent_id,
        )
    except LanguageNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El idioma no existe.",
        ) from error
    except CategoryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría padre no existe.",
        ) from error
    except CategoryAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre en el mismo nivel.",
        ) from error
    except CategoryParentLanguageMismatchError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="La categoría padre pertenece a otro idioma.",
        ) from error
    except CategoryNestingLimitError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="No se pueden crear categorías con más de dos niveles.",
        ) from error
    except InvalidCategoryNameError as error:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El nombre de la categoría debe contener entre 1 y 80 caracteres.",
        ) from error
    return CategoryResponse.model_validate(category)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    language_id: int,
    category_id: int,
    service: CategoryServiceDependency,
) -> None:
    try:
        service.delete_category(language_id=language_id, category_id=category_id)
    except LanguageNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El idioma no existe.",
        ) from error
    except CategoryNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La categoría no existe en este idioma.",
        ) from error
