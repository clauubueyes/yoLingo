from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from yolingo.models.flashcard import Flashcard


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
