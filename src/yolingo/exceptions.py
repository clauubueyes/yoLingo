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
