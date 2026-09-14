from yolingo.exceptions import (
    CategoryAlreadyExistsError,
    CategoryNestingLimitError,
    CategoryNotFoundError,
    CategoryParentLanguageMismatchError,
    InvalidCategoryNameError,
    LanguageNotFoundError,
)
from yolingo.models.category import Category
from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.languages import LanguageRepository

MAX_CATEGORY_NAME_LENGTH = 80


class CategoryService:
    def __init__(
        self,
        category_repository: CategoryRepository,
        language_repository: LanguageRepository,
    ) -> None:
        self._categories = category_repository
        self._languages = language_repository

    def list_categories(self, language_id: int) -> list[Category]:
        self._require_language(language_id)
        return self._categories.list_by_language(language_id)

    def create_category(
        self,
        *,
        language_id: int,
        name: str,
        parent_id: int | None = None,
    ) -> Category:
        self._require_language(language_id)
        normalized_name = self._normalize_name(name)

        if parent_id is not None:
            parent = self._categories.get_by_id(parent_id)
            if parent is None:
                raise CategoryNotFoundError
            if parent.language_id != language_id:
                raise CategoryParentLanguageMismatchError
            if parent.parent_id is not None:
                raise CategoryNestingLimitError

        if self._categories.name_exists(
            language_id=language_id,
            parent_id=parent_id,
            name=normalized_name,
        ):
            raise CategoryAlreadyExistsError

        return self._categories.create(
            language_id=language_id,
            name=normalized_name,
            parent_id=parent_id,
        )

    def delete_category(self, *, language_id: int, category_id: int) -> None:
        self._require_language(language_id)
        category = self._categories.get_by_id(category_id)
        if category is None or category.language_id != language_id:
            raise CategoryNotFoundError
        self._categories.delete(category_id)

    def _require_language(self, language_id: int) -> None:
        if self._languages.get_by_id(language_id) is None:
            raise LanguageNotFoundError

    @staticmethod
    def _normalize_name(name: str) -> str:
        normalized_name = name.strip()
        if not normalized_name or len(normalized_name) > MAX_CATEGORY_NAME_LENGTH:
            raise InvalidCategoryNameError
        return normalized_name
