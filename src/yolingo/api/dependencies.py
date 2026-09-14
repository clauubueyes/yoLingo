from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.flashcards import FlashcardRepository
from yolingo.repositories.languages import LanguageRepository
from yolingo.repositories.tags import TagRepository
from yolingo.services.categories import CategoryService
from yolingo.services.flashcards import FlashcardService
from yolingo.services.languages import LanguageService
from yolingo.services.tags import TagService


def get_session(request: Request):
    yield from request.app.state.database.sessions()


SessionDependency = Annotated[Session, Depends(get_session)]


def get_language_service(session: SessionDependency) -> LanguageService:
    return LanguageService(LanguageRepository(session))


LanguageServiceDependency = Annotated[LanguageService, Depends(get_language_service)]


def get_category_service(session: SessionDependency) -> CategoryService:
    return CategoryService(CategoryRepository(session), LanguageRepository(session))


CategoryServiceDependency = Annotated[CategoryService, Depends(get_category_service)]


def get_flashcard_service(session: SessionDependency) -> FlashcardService:
    return FlashcardService(
        FlashcardRepository(session),
        CategoryRepository(session),
        LanguageRepository(session),
    )


FlashcardServiceDependency = Annotated[FlashcardService, Depends(get_flashcard_service)]


def get_tag_service(session: SessionDependency) -> TagService:
    return TagService(
        TagRepository(session),
        FlashcardRepository(session),
        LanguageRepository(session),
        CategoryRepository(session),
    )


TagServiceDependency = Annotated[TagService, Depends(get_tag_service)]
