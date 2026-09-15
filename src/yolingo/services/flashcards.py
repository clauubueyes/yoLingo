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
from yolingo.models.category import Category
from yolingo.models.flashcard import Flashcard
from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.flashcards import FlashcardRepository
from yolingo.repositories.languages import LanguageRepository
from yolingo.repositories.tags import TagRepository


class FlashcardService:
    def __init__(
        self,
        flashcard_repository: FlashcardRepository,
        category_repository: CategoryRepository,
        language_repository: LanguageRepository,
        tag_repository: TagRepository,
    ) -> None:
        self._flashcards = flashcard_repository
        self._categories = category_repository
        self._languages = language_repository
        self._tags = tag_repository

    def list_flashcards(self, *, language_id: int, category_id: int) -> list[Flashcard]:
        return self.filter_flashcards(language_id=language_id, category_id=category_id)

    def filter_flashcards(
        self,
        *,
        language_id: int,
        category_id: int,
        search: str | None = None,
        tag_ids: list[int] | None = None,
    ) -> list[Flashcard]:
        self._require_category(language_id=language_id, category_id=category_id)
        unique_tag_ids = list(dict.fromkeys(tag_ids or []))
        for tag_id in unique_tag_ids:
            tag = self._tags.get_by_id(tag_id)
            if tag is None:
                raise TagNotFoundError
            if tag.language_id != language_id:
                raise TagLanguageMismatchError

        normalized_search = search.strip() if search else None
        return self._flashcards.filter(
            language_id=language_id,
            category_id=category_id,
            search=normalized_search or None,
            tag_ids=unique_tag_ids,
        )

    def get_flashcard(self, flashcard_id: int) -> Flashcard:
        return self._require_flashcard(flashcard_id)

    def create_flashcard(
        self,
        *,
        language_id: int,
        category_id: int,
        term: str,
        translation: str,
        example: str | None,
        notes: str | None,
    ) -> Flashcard:
        self._require_category(language_id=language_id, category_id=category_id)
        normalized_term = self._normalize_term(term)
        normalized_translation = self._normalize_translation(translation)
        normalized_example = self._normalize_optional_text(example)
        normalized_notes = self._normalize_optional_text(notes)
        self._require_unique(
            category_id=category_id,
            term=normalized_term,
            translation=normalized_translation,
        )
        return self._flashcards.create(
            language_id=language_id,
            category_id=category_id,
            term=normalized_term,
            translation=normalized_translation,
            example=normalized_example,
            notes=normalized_notes,
        )

    def update_flashcard(
        self,
        flashcard_id: int,
        *,
        term: str,
        translation: str,
        example: str | None,
        notes: str | None,
    ) -> Flashcard:
        flashcard = self._require_flashcard(flashcard_id)
        normalized_term = self._normalize_term(term)
        normalized_translation = self._normalize_translation(translation)
        self._require_unique(
            category_id=flashcard.category_id,
            term=normalized_term,
            translation=normalized_translation,
            excluding_id=flashcard.id,
        )
        updated = self._flashcards.update(
            flashcard.id,
            term=normalized_term,
            translation=normalized_translation,
            example=self._normalize_optional_text(example),
            notes=self._normalize_optional_text(notes),
        )
        if updated is None:
            raise FlashcardNotFoundError
        return updated

    def delete_flashcard(self, flashcard_id: int) -> None:
        self._require_flashcard(flashcard_id)
        if not self._flashcards.delete(flashcard_id):
            raise FlashcardNotFoundError

    def _require_category(self, *, language_id: int, category_id: int) -> Category:
        if self._languages.get_by_id(language_id) is None:
            raise LanguageNotFoundError
        category = self._categories.get_by_id(category_id)
        if category is None:
            raise CategoryNotFoundError
        if category.language_id != language_id:
            raise CategoryLanguageMismatchError
        return category

    def _require_flashcard(self, flashcard_id: int) -> Flashcard:
        flashcard = self._flashcards.get_by_id(flashcard_id)
        if flashcard is None:
            raise FlashcardNotFoundError
        return flashcard

    def _require_unique(
        self,
        *,
        category_id: int,
        term: str,
        translation: str,
        excluding_id: int | None = None,
    ) -> None:
        if self._flashcards.duplicate_exists(
            category_id=category_id,
            term=term,
            translation=translation,
            excluding_id=excluding_id,
        ):
            raise FlashcardAlreadyExistsError

    @staticmethod
    def _normalize_term(term: str) -> str:
        normalized = term.strip()
        if not normalized:
            raise InvalidFlashcardTermError
        return normalized

    @staticmethod
    def _normalize_translation(translation: str) -> str:
        normalized = translation.strip()
        if not normalized:
            raise InvalidFlashcardTranslationError
        return normalized

    @staticmethod
    def _normalize_optional_text(value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None
