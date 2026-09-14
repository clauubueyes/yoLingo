class LanguageAlreadyExistsError(Exception):
    """Raised when a language name or code is already stored."""


class LanguageNotFoundError(Exception):
    """Raised when the requested language does not exist."""


class CategoryNotFoundError(Exception):
    """Raised when the requested category does not exist in the language."""


class InvalidCategoryNameError(Exception):
    """Raised when a category name does not satisfy the domain rules."""


class CategoryAlreadyExistsError(Exception):
    """Raised when a category name already exists at the same level."""


class CategoryParentLanguageMismatchError(Exception):
    """Raised when a parent category belongs to a different language."""


class CategoryNestingLimitError(Exception):
    """Raised when an attempt would create more than two category levels."""


class CategoryLanguageMismatchError(Exception):
    """Raised when a category does not belong to the requested language."""


class FlashcardNotFoundError(Exception):
    """Raised when the requested flashcard does not exist."""


class InvalidFlashcardTermError(Exception):
    """Raised when a flashcard term is empty."""


class InvalidFlashcardTranslationError(Exception):
    """Raised when a flashcard translation is empty."""


class FlashcardAlreadyExistsError(Exception):
    """Raised when the same term and translation already exist in a category."""


class TagNotFoundError(Exception):
    """Raised when the requested tag does not exist."""


class InvalidTagNameError(Exception):
    """Raised when a tag name does not satisfy the domain rules."""


class TagAlreadyExistsError(Exception):
    """Raised when a tag name already exists in a language."""


class TagLanguageMismatchError(Exception):
    """Raised when a tag and flashcard belong to different languages."""
