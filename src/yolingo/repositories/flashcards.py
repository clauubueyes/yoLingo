from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from yolingo.models.flashcard import Flashcard
from yolingo.models.tag import Tag, flashcard_tags


class FlashcardRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_by_category(self, category_id: int) -> list[Flashcard]:
        statement = (
            select(Flashcard)
            .where(Flashcard.category_id == category_id)
            .order_by(func.lower(Flashcard.term), Flashcard.id)
        )
        return list(self._session.scalars(statement))

    def get_by_id(self, flashcard_id: int) -> Flashcard | None:
        return self._session.get(Flashcard, flashcard_id)

    def get_tags(self, flashcard_id: int) -> list[Tag]:
        statement = (
            select(Tag)
            .join(flashcard_tags, Tag.id == flashcard_tags.c.tag_id)
            .where(flashcard_tags.c.flashcard_id == flashcard_id)
            .order_by(func.lower(Tag.name), Tag.id)
        )
        return list(self._session.scalars(statement))

    def add_tag(self, flashcard: Flashcard, tag: Tag) -> bool:
        if tag in flashcard.tags:
            return False
        flashcard.tags.append(tag)
        self._session.commit()
        return True

    def remove_tag(self, flashcard: Flashcard, tag: Tag) -> bool:
        if tag not in flashcard.tags:
            return False
        flashcard.tags.remove(tag)
        self._session.commit()
        return True

    def replace_tags(self, flashcard: Flashcard, tags: list[Tag]) -> None:
        flashcard.tags = tags
        self._session.commit()

    def filter(
        self,
        *,
        language_id: int,
        category_id: int,
        search: str | None,
        tag_ids: list[int],
    ) -> list[Flashcard]:
        statement = select(Flashcard).where(
            Flashcard.language_id == language_id,
            Flashcard.category_id == category_id,
        )
        if search:
            lowered_search = search.lower()
            statement = statement.where(
                or_(
                    func.lower(Flashcard.term).contains(lowered_search, autoescape=True),
                    func.lower(Flashcard.translation).contains(lowered_search, autoescape=True),
                )
            )
        if tag_ids:
            statement = (
                statement.join(flashcard_tags)
                .where(flashcard_tags.c.tag_id.in_(tag_ids))
                .group_by(Flashcard.id)
                .having(func.count(func.distinct(flashcard_tags.c.tag_id)) == len(tag_ids))
            )
        statement = statement.order_by(func.lower(Flashcard.term), Flashcard.id)
        return list(self._session.scalars(statement))

    def duplicate_exists(
        self,
        *,
        category_id: int,
        term: str,
        translation: str,
        excluding_id: int | None = None,
    ) -> bool:
        statement = select(Flashcard.id).where(
            Flashcard.category_id == category_id,
            Flashcard.term == term,
            Flashcard.translation == translation,
        )
        if excluding_id is not None:
            statement = statement.where(Flashcard.id != excluding_id)
        return self._session.scalar(statement.limit(1)) is not None

    def create(
        self,
        *,
        language_id: int,
        category_id: int,
        term: str,
        translation: str,
        example: str | None,
        notes: str | None,
    ) -> Flashcard:
        flashcard = Flashcard(
            language_id=language_id,
            category_id=category_id,
            term=term,
            translation=translation,
            example=example,
            notes=notes,
        )
        self._session.add(flashcard)
        try:
            self._session.commit()
        except IntegrityError:
            self._session.rollback()
            raise
        self._session.refresh(flashcard)
        return flashcard

    def update(
        self,
        flashcard_id: int,
        *,
        term: str,
        translation: str,
        example: str | None,
        notes: str | None,
    ) -> Flashcard | None:
        flashcard = self._session.get(Flashcard, flashcard_id)
        if flashcard is None:
            return None

        flashcard.term = term
        flashcard.translation = translation
        flashcard.example = example
        flashcard.notes = notes
        try:
            self._session.commit()
        except IntegrityError:
            self._session.rollback()
            raise
        self._session.refresh(flashcard)
        return flashcard

    def delete(self, flashcard_id: int) -> bool:
        flashcard = self._session.get(Flashcard, flashcard_id)
        if flashcard is None:
            return False

        self._session.delete(flashcard)
        self._session.commit()
        return True
