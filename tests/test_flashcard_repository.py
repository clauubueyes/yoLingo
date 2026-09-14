from fastapi import FastAPI
from sqlalchemy.orm import Session

from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.flashcards import FlashcardRepository
from yolingo.repositories.languages import LanguageRepository


def create_category(
    session: Session,
    *,
    language_name: str,
    code: str,
    name: str,
) -> tuple[int, int]:
    language = LanguageRepository(session).create(name=language_name, code=code, flag=None)
    category = CategoryRepository(session).create(
        language_id=language.id,
        name=name,
        parent_id=None,
    )
    return language.id, category.id


def test_list_flashcards_only_returns_cards_from_the_category(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, greetings_id = create_category(
            session,
            language_name="Norwegian",
            code="nb",
            name="Greetings",
        )
        other_category = CategoryRepository(session).create(
            language_id=language_id,
            name="Grammar",
            parent_id=None,
        )
        flashcards = FlashcardRepository(session)
        flashcards.create(
            language_id=language_id,
            category_id=greetings_id,
            term="hello",
            translation="hola",
            example=None,
            notes=None,
        )
        flashcards.create(
            language_id=language_id,
            category_id=greetings_id,
            term="good morning",
            translation="buenos días",
            example=None,
            notes=None,
        )
        flashcards.create(
            language_id=language_id,
            category_id=other_category.id,
            term="pronoun",
            translation="pronombre",
            example=None,
            notes=None,
        )

        result = flashcards.list_by_category(greetings_id)

        assert [(flashcard.term, flashcard.translation) for flashcard in result] == [
            ("good morning", "buenos días"),
            ("hello", "hola"),
        ]


def test_create_and_get_flashcard_persists_all_fields(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_category(
            session,
            language_name="Norwegian",
            code="nb",
            name="Greetings",
        )
        flashcards = FlashcardRepository(session)

        created = flashcards.create(
            language_id=language_id,
            category_id=category_id,
            term="hello",
            translation="hola",
            example="Hello, how are you?",
            notes="Informal greeting",
        )
        created_id = created.id
        session.expunge_all()
        found = flashcards.get_by_id(created_id)

        assert found is not None
        assert found.language_id == language_id
        assert found.category_id == category_id
        assert found.term == "hello"
        assert found.translation == "hola"
        assert found.example == "Hello, how are you?"
        assert found.notes == "Informal greeting"
        assert found.created_at is not None
        assert found.updated_at is not None
        assert found.language.name == "Norwegian"
        assert found.category.name == "Greetings"


def test_update_flashcard_persists_edited_content(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_category(
            session,
            language_name="Norwegian",
            code="nb",
            name="Greetings",
        )
        flashcards = FlashcardRepository(session)
        created = flashcards.create(
            language_id=language_id,
            category_id=category_id,
            term="hello",
            translation="hola",
            example=None,
            notes=None,
        )

        updated = flashcards.update(
            created.id,
            term="good morning",
            translation="buenos días",
            example="Good morning!",
            notes="Used before noon",
        )

        assert updated is not None
        assert updated.term == "good morning"
        assert updated.translation == "buenos días"
        assert updated.example == "Good morning!"
        assert updated.notes == "Used before noon"


def test_update_and_delete_return_empty_results_for_unknown_ids(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        flashcards = FlashcardRepository(session)

        updated = flashcards.update(
            999,
            term="hello",
            translation="hola",
            example=None,
            notes=None,
        )

        assert updated is None
        assert flashcards.delete(999) is False


def test_delete_flashcard_removes_it(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_category(
            session,
            language_name="Norwegian",
            code="nb",
            name="Greetings",
        )
        flashcards = FlashcardRepository(session)
        created = flashcards.create(
            language_id=language_id,
            category_id=category_id,
            term="hello",
            translation="hola",
            example=None,
            notes=None,
        )

        deleted = flashcards.delete(created.id)

        assert deleted is True
        assert flashcards.get_by_id(created.id) is None


def test_deleting_category_removes_its_flashcards(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id, category_id = create_category(
            session,
            language_name="Norwegian",
            code="nb",
            name="Greetings",
        )
        flashcards = FlashcardRepository(session)
        created = flashcards.create(
            language_id=language_id,
            category_id=category_id,
            term="hello",
            translation="hola",
            example=None,
            notes=None,
        )

        CategoryRepository(session).delete(category_id)

        assert flashcards.get_by_id(created.id) is None
