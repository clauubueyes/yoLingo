from yolingo.exceptions import (
    FlashcardNotFoundError,
    InvalidTagNameError,
    LanguageNotFoundError,
    TagAlreadyExistsError,
    TagLanguageMismatchError,
    TagNotFoundError,
)
from yolingo.models.flashcard import Flashcard
from yolingo.models.tag import Tag
from yolingo.repositories.flashcards import FlashcardRepository
from yolingo.repositories.languages import LanguageRepository
from yolingo.repositories.tags import TagRepository

MAX_TAG_NAME_LENGTH = 80


class TagService:
    def __init__(
        self,
        tag_repository: TagRepository,
        flashcard_repository: FlashcardRepository,
        language_repository: LanguageRepository,
    ) -> None:
        self._tags = tag_repository
        self._flashcards = flashcard_repository
        self._languages = language_repository

    def list_tags(self, language_id: int) -> list[Tag]:
        self._require_language(language_id)
        return self._tags.list_by_language(language_id)

    def create_tag(self, *, language_id: int, name: str) -> Tag:
        self._require_language(language_id)
        normalized_name = name.strip()
        if not normalized_name or len(normalized_name) > MAX_TAG_NAME_LENGTH:
            raise InvalidTagNameError
        if self._tags.name_exists(language_id=language_id, name=normalized_name):
            raise TagAlreadyExistsError
        return self._tags.create(language_id=language_id, name=normalized_name)

    def delete_tag(self, tag_id: int) -> None:
        if self._tags.get_by_id(tag_id) is None or not self._tags.delete(tag_id):
            raise TagNotFoundError

    def get_flashcard_tags(self, flashcard_id: int) -> list[Tag]:
        self._require_flashcard(flashcard_id)
        return self._flashcards.get_tags(flashcard_id)

    def assign_tag(self, *, flashcard_id: int, tag_id: int) -> bool:
        flashcard = self._require_flashcard(flashcard_id)
        tag = self._require_tag(tag_id)
        self._require_same_language(flashcard, tag)
        return self._flashcards.add_tag(flashcard, tag)

    def remove_tag(self, *, flashcard_id: int, tag_id: int) -> bool:
        flashcard = self._require_flashcard(flashcard_id)
        tag = self._require_tag(tag_id)
        self._require_same_language(flashcard, tag)
        return self._flashcards.remove_tag(flashcard, tag)

    def update_flashcard_tags(self, *, flashcard_id: int, tag_ids: list[int]) -> list[Tag]:
        flashcard = self._require_flashcard(flashcard_id)
        unique_tag_ids = list(dict.fromkeys(tag_ids))
        tags = [self._require_tag(tag_id) for tag_id in unique_tag_ids]
        for tag in tags:
            self._require_same_language(flashcard, tag)
        self._flashcards.replace_tags(flashcard, tags)
        return self._flashcards.get_tags(flashcard_id)

    def _require_language(self, language_id: int) -> None:
        if self._languages.get_by_id(language_id) is None:
            raise LanguageNotFoundError

    def _require_flashcard(self, flashcard_id: int) -> Flashcard:
        flashcard = self._flashcards.get_by_id(flashcard_id)
        if flashcard is None:
            raise FlashcardNotFoundError
        return flashcard

    def _require_tag(self, tag_id: int) -> Tag:
        tag = self._tags.get_by_id(tag_id)
        if tag is None:
            raise TagNotFoundError
        return tag

    @staticmethod
    def _require_same_language(flashcard: Flashcard, tag: Tag) -> None:
        if flashcard.language_id != tag.language_id:
            raise TagLanguageMismatchError
