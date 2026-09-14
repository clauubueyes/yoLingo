from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from yolingo.models.tag import Tag


class TagRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_by_language(self, language_id: int) -> list[Tag]:
        statement = (
            select(Tag)
            .where(Tag.language_id == language_id)
            .order_by(func.lower(Tag.name), Tag.id)
        )
        return list(self._session.scalars(statement))

    def get_by_id(self, tag_id: int) -> Tag | None:
        return self._session.get(Tag, tag_id)

    def create(self, *, language_id: int, name: str) -> Tag:
        tag = Tag(language_id=language_id, name=name)
        self._session.add(tag)
        try:
            self._session.commit()
        except IntegrityError:
            self._session.rollback()
            raise
        self._session.refresh(tag)
        return tag

    def delete(self, tag_id: int) -> bool:
        tag = self._session.get(Tag, tag_id)
        if tag is None:
            return False

        self._session.delete(tag)
        self._session.commit()
        return True
