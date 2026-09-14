import pytest
from fastapi import FastAPI
from sqlalchemy.orm import Session

from yolingo.exceptions import (
    CategoryLanguageMismatchError,
    CategoryNotFoundError,
    FlashcardAlreadyExistsError,
    FlashcardNotFoundError,
    InvalidFlashcardTermError,
    InvalidFlashcardTranslationError,
    LanguageNotFoundError,
)
from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.flashcards import FlashcardRepository
from yolingo.repositories.languages import LanguageRepository
from yolingo.services.flashcards import FlashcardService


def build_service(session: Session) -> FlashcardService:
    return FlashcardService(
        FlashcardRepository(session),
        CategoryRepository(session),
        LanguageRepository(session),
    )


def create_language_and_category(
    session: Session,
    *,
    language_name: str = "Norwegian",
    code: str = "nb",
    category_name: str = "Greetings",
) -> tuple[int, int]:
    language = LanguageRepository(session).create(name=language_name, code=code, flag=None)
    category = CategoryRepository(session).create(
        language_id=language.id,
        name=category_name,
        parent_id=None,
    )
    return language.id, category.id


def create_flashcard(
    service: FlashcardService,
    *,
    language_id: int,
    category_id: int,
    term: str = "hello",
    translation: str = "hola",
):
    return service.create_flashcard(
        language_id=language_id,
        category_id=category_id,
        term=term,
        translation=translation,
        example=None,
        notes=None,
    )


def test_create_and_get_flashcard_normalizes_its_content(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)
        service = build_service(session)

        created = service.create_flashcard(
            language_id=language_id,
            category_id=category_id,
            term="  hello  ",
            translation="  hola  ",
            example="  Hello, how are you?  ",
            notes="   ",
        )
        found = service.get_flashcard(created.id)

        assert found.term == "hello"
        assert found.translation == "hola"
        assert found.example == "Hello, how are you?"
        assert found.notes is None


def test_list_flashcards_validates_language_and_category(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)
        service = build_service(session)
        created = create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
        )

        result = service.list_flashcards(language_id=language_id, category_id=category_id)

        assert result == [created]


def test_update_flashcard_changes_only_its_content(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)
        service = build_service(session)
        created = create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
        )

        updated = service.update_flashcard(
            created.id,
            term="  good morning ",
            translation=" buenos días ",
            example=" Good morning! ",
            notes=" Used before noon ",
        )

        assert updated.language_id == language_id
        assert updated.category_id == category_id
        assert updated.term == "good morning"
        assert updated.translation == "buenos días"
        assert updated.example == "Good morning!"
        assert updated.notes == "Used before noon"


def test_delete_flashcard_removes_it(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)
        service = build_service(session)
        created = create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
        )

        service.delete_flashcard(created.id)

        with pytest.raises(FlashcardNotFoundError):
            service.get_flashcard(created.id)


def test_flashcard_requires_an_existing_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session, pytest.raises(LanguageNotFoundError):
        build_service(session).list_flashcards(language_id=999, category_id=999)


def test_flashcard_requires_an_existing_category(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id = LanguageRepository(session).create(
            name="Norwegian",
            code="nb",
            flag=None,
        ).id

        with pytest.raises(CategoryNotFoundError):
            create_flashcard(
                build_service(session),
                language_id=language_id,
                category_id=999,
            )


def test_category_must_belong_to_the_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        norwegian_id, _ = create_language_and_category(session)
        _, french_category_id = create_language_and_category(
            session,
            language_name="French",
            code="fr",
            category_name="Salutations",
        )

        with pytest.raises(CategoryLanguageMismatchError):
            create_flashcard(
                build_service(session),
                language_id=norwegian_id,
                category_id=french_category_id,
            )


@pytest.mark.parametrize(
    ("term", "translation", "expected_error"),
    [
        ("", "hola", InvalidFlashcardTermError),
        ("   ", "hola", InvalidFlashcardTermError),
        ("hello", "", InvalidFlashcardTranslationError),
        ("hello", "   ", InvalidFlashcardTranslationError),
    ],
)
def test_flashcard_rejects_empty_required_content(
    app: FastAPI,
    term: str,
    translation: str,
    expected_error: type[Exception],
) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)

        with pytest.raises(expected_error):
            create_flashcard(
                build_service(session),
                language_id=language_id,
                category_id=category_id,
                term=term,
                translation=translation,
            )


def test_unknown_flashcard_id_is_rejected(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        service = build_service(session)

        with pytest.raises(FlashcardNotFoundError):
            service.get_flashcard(999)
        with pytest.raises(FlashcardNotFoundError):
            service.update_flashcard(
                999,
                term="hello",
                translation="hola",
                example=None,
                notes=None,
            )
        with pytest.raises(FlashcardNotFoundError):
            service.delete_flashcard(999)


def test_exact_duplicate_is_rejected_within_the_same_category(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)
        service = build_service(session)
        create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
        )

        with pytest.raises(FlashcardAlreadyExistsError):
            create_flashcard(
                service,
                language_id=language_id,
                category_id=category_id,
                term=" hello ",
                translation=" hola ",
            )


def test_same_term_with_another_translation_is_allowed(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)
        service = build_service(session)
        create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
        )

        created = create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
            term="hello",
            translation="buenas",
        )

        assert created.id is not None


def test_update_cannot_duplicate_another_flashcard(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_language_and_category(session)
        service = build_service(session)
        first = create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
        )
        second = create_flashcard(
            service,
            language_id=language_id,
            category_id=category_id,
            term="good morning",
            translation="buenos días",
        )

        with pytest.raises(FlashcardAlreadyExistsError):
            service.update_flashcard(
                second.id,
                term=first.term,
                translation=first.translation,
                example=None,
                notes=None,
            )
