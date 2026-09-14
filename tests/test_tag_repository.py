from fastapi import FastAPI
from sqlalchemy.orm import Session

from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.flashcards import FlashcardRepository
from yolingo.repositories.languages import LanguageRepository
from yolingo.repositories.tags import TagRepository


def create_flashcard(session: Session, *, term: str = "hello"):
    language = LanguageRepository(session).create(name="Norwegian", code="nb", flag=None)
    category = CategoryRepository(session).create(
        language_id=language.id,
        name="Greetings",
        parent_id=None,
    )
    flashcard = FlashcardRepository(session).create(
        language_id=language.id,
        category_id=category.id,
        term=term,
        translation="hola",
        example=None,
        notes=None,
    )
    return language, category, flashcard


def test_create_get_and_list_tags_for_a_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        norwegian = LanguageRepository(session).create(name="Norwegian", code="nb", flag=None)
        french = LanguageRepository(session).create(name="French", code="fr", flag=None)
        tags = TagRepository(session)
        essential = tags.create(language_id=norwegian.id, name="essential")
        tags.create(language_id=norwegian.id, name="A1")
        tags.create(language_id=french.id, name="débutant")

        result = tags.list_by_language(norwegian.id)

        assert [tag.name for tag in result] == ["A1", "essential"]
        assert tags.get_by_id(essential.id) is essential
        assert essential.language is norwegian


def test_flashcard_can_have_multiple_tags(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, _, flashcard = create_flashcard(session)
        tags = TagRepository(session)
        a1 = tags.create(language_id=language.id, name="A1")
        essential = tags.create(language_id=language.id, name="essential")
        flashcards = FlashcardRepository(session)

        assert flashcards.add_tag(flashcard, essential) is True
        assert flashcards.add_tag(flashcard, a1) is True

        assert [tag.name for tag in flashcards.get_tags(flashcard.id)] == ["A1", "essential"]
        assert flashcards.add_tag(flashcard, a1) is False


def test_tag_can_be_used_by_multiple_flashcards(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, category, first = create_flashcard(session)
        flashcards = FlashcardRepository(session)
        second = flashcards.create(
            language_id=language.id,
            category_id=category.id,
            term="good morning",
            translation="buenos días",
            example=None,
            notes=None,
        )
        essential = TagRepository(session).create(language_id=language.id, name="essential")

        flashcards.add_tag(first, essential)
        flashcards.add_tag(second, essential)

        assert {flashcard.id for flashcard in essential.flashcards} == {first.id, second.id}


def test_remove_tag_only_deletes_the_association(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, _, flashcard = create_flashcard(session)
        tags = TagRepository(session)
        tag = tags.create(language_id=language.id, name="essential")
        flashcards = FlashcardRepository(session)
        flashcards.add_tag(flashcard, tag)

        removed = flashcards.remove_tag(flashcard, tag)

        assert removed is True
        assert flashcards.get_tags(flashcard.id) == []
        assert tags.get_by_id(tag.id) is tag
        assert flashcards.remove_tag(flashcard, tag) is False


def test_delete_tag_removes_associations_but_preserves_flashcards(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, _, flashcard = create_flashcard(session)
        tags = TagRepository(session)
        deleted_tag = tags.create(language_id=language.id, name="essential")
        preserved_tag = tags.create(language_id=language.id, name="A1")
        flashcards = FlashcardRepository(session)
        flashcards.add_tag(flashcard, deleted_tag)
        flashcards.add_tag(flashcard, preserved_tag)

        deleted = tags.delete(deleted_tag.id)

        assert deleted is True
        assert tags.get_by_id(deleted_tag.id) is None
        assert flashcards.get_by_id(flashcard.id) is flashcard
        assert flashcards.get_tags(flashcard.id) == [preserved_tag]


def test_delete_unknown_tag_returns_false(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        assert TagRepository(session).delete(999) is False
