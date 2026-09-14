from yolingo.models.language import Language
from yolingo.repositories.languages import LanguageRepository


class LanguageService:
    def __init__(self, repository: LanguageRepository) -> None:
        self._repository = repository

    def list_languages(self) -> list[Language]:
        return self._repository.list_all()

    def create_language(self, *, name: str, code: str, flag: str | None) -> Language:
        return self._repository.create(
            name=name.strip(),
            code=code.strip().lower(),
            flag=flag.strip() if flag else None,
        )
