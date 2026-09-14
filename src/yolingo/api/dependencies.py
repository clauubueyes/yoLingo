from typing import Annotated

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from yolingo.repositories.languages import LanguageRepository
from yolingo.services.languages import LanguageService


def get_session(request: Request):
    yield from request.app.state.database.sessions()


SessionDependency = Annotated[Session, Depends(get_session)]


def get_language_service(session: SessionDependency) -> LanguageService:
    return LanguageService(LanguageRepository(session))


LanguageServiceDependency = Annotated[LanguageService, Depends(get_language_service)]
