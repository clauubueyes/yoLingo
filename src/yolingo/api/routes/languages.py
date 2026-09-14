from fastapi import APIRouter, HTTPException, status

from yolingo.api.dependencies import LanguageServiceDependency
from yolingo.exceptions import LanguageAlreadyExistsError
from yolingo.schemas.language import LanguageCreate, LanguageResponse

router = APIRouter(prefix="/languages", tags=["languages"])


@router.get("", response_model=list[LanguageResponse])
def list_languages(service: LanguageServiceDependency) -> list[LanguageResponse]:
    return [LanguageResponse.model_validate(language) for language in service.list_languages()]


@router.post("", response_model=LanguageResponse, status_code=status.HTTP_201_CREATED)
def create_language(
    payload: LanguageCreate,
    service: LanguageServiceDependency,
) -> LanguageResponse:
    try:
        language = service.create_language(
            name=payload.name,
            code=payload.code,
            flag=payload.flag,
        )
    except LanguageAlreadyExistsError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un idioma con ese nombre o código.",
        ) from error
    return LanguageResponse.model_validate(language)
