from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from yolingo.exceptions import LanguageAlreadyExistsError
from yolingo.models.language import Language


class LanguageRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[Language]:
        statement = select(Language).order_by(func.lower(Language.name))
        return list(self._session.scalars(statement))

    def get_by_id(self, language_id: int) -> Language | None:
        return self._session.get(Language, language_id)

    def create(self, *, name: str, code: str, flag: str | None) -> Language:
        language = Language(name=name, code=code, flag=flag)
        self._session.add(language)
        try:
            self._session.commit()
        except IntegrityError as error:
            self._session.rollback()
            raise LanguageAlreadyExistsError from error
        self._session.refresh(language)
        return language
