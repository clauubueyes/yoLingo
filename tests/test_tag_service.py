import pytest
from fastapi import FastAPI
from sqlalchemy.orm import Session

from yolingo.exceptions import (
    CategoryLanguageMismatchError,
    CategoryNotFoundError,
    FlashcardNotFoundError,
    InvalidTagNameError,
    LanguageNotFoundError,
    TagAlreadyExistsError,
    TagLanguageMismatchError,
    TagNotFoundError,
)
from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.flashcards import FlashcardRepository
from yolingo.repositories.languages import LanguageRepository
from yolingo.repositories.tags import TagRepository
from yolingo.services.flashcards import FlashcardService
from yolingo.services.tags import TagService


def build_service(session: Session) -> TagService:
    return TagService(
        TagRepository(session),
        FlashcardRepository(session),
        LanguageRepository(session),
    )


def build_flashcard_service(session: Session) -> FlashcardService:
    return FlashcardService(
        FlashcardRepository(session),
        CategoryRepository(session),
        LanguageRepository(session),
        TagRepository(session),
    )


def create_library(
    session: Session,
    *,
    language_name: str = "Norwegian",
    code: str = "nb",
):
    language = LanguageRepository(session).create(name=language_name, code=code, flag=None)
    category = CategoryRepository(session).create(
        language_id=language.id,
        name="Grammar",
        parent_id=None,
    )
    flashcard = FlashcardRepository(session).create(
        language_id=language.id,
        category_id=category.id,
        term="pronoun",
        translation="pronombre",
        example=None,
        notes=None,
    )
    return language, category, flashcard


def test_create_and_list_tags_normalizes_names(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, _, _ = create_library(session)
        service = build_service(session)

        service.create_tag(language_id=language.id, name="  essential  ")
        service.create_tag(language_id=language.id, name="A1")

        assert [tag.name for tag in service.list_tags(language.id)] == ["A1", "essential"]


@pytest.mark.parametrize("name", ["", "   ", "a" * 81])
def test_create_tag_rejects_invalid_names(app: FastAPI, name: str) -> None:
    with Session(app.state.database.engine) as session:
        language, _, _ = create_library(session)

        with pytest.raises(InvalidTagNameError):
            build_service(session).create_tag(language_id=language.id, name=name)


def test_tags_require_an_existing_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        service = build_service(session)

        with pytest.raises(LanguageNotFoundError):
            service.list_tags(999)
        with pytest.raises(LanguageNotFoundError):
            service.create_tag(language_id=999, name="A1")


def test_duplicate_tag_name_is_rejected_ignoring_case(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, _, _ = create_library(session)
        service = build_service(session)
        service.create_tag(language_id=language.id, name="essential")

        with pytest.raises(TagAlreadyExistsError):
            service.create_tag(language_id=language.id, name="ESSENTIAL")


def test_assign_remove_and_update_flashcard_tags(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, _, flashcard = create_library(session)
        service = build_service(session)
        a1 = service.create_tag(language_id=language.id, name="A1")
        essential = service.create_tag(language_id=language.id, name="essential")

        assert service.assign_tag(flashcard_id=flashcard.id, tag_id=a1.id) is True
        assert service.assign_tag(flashcard_id=flashcard.id, tag_id=a1.id) is False
        assert service.remove_tag(flashcard_id=flashcard.id, tag_id=a1.id) is True
        assert service.remove_tag(flashcard_id=flashcard.id, tag_id=a1.id) is False

        result = service.update_flashcard_tags(
            flashcard_id=flashcard.id,
            tag_ids=[essential.id, a1.id, essential.id],
        )

        assert [tag.name for tag in result] == ["A1", "essential"]
        assert service.update_flashcard_tags(flashcard_id=flashcard.id, tag_ids=[]) == []


def test_tag_from_another_language_cannot_be_assigned(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        _, _, flashcard = create_library(session)
        french, _, _ = create_library(session, language_name="French", code="fr")
        service = build_service(session)
        french_tag = service.create_tag(language_id=french.id, name="débutant")

        with pytest.raises(TagLanguageMismatchError):
            service.assign_tag(flashcard_id=flashcard.id, tag_id=french_tag.id)


def test_missing_flashcard_or_tag_is_rejected(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        _, _, flashcard = create_library(session)
        service = build_service(session)

        with pytest.raises(FlashcardNotFoundError):
            service.update_flashcard_tags(flashcard_id=999, tag_ids=[])
        with pytest.raises(TagNotFoundError):
            service.assign_tag(flashcard_id=flashcard.id, tag_id=999)


def test_delete_tag_removes_it_and_its_associations(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, _, flashcard = create_library(session)
        service = build_service(session)
        tag = service.create_tag(language_id=language.id, name="essential")
        service.assign_tag(flashcard_id=flashcard.id, tag_id=tag.id)

        service.delete_tag(tag.id)

        assert service.get_flashcard_tags(flashcard.id) == []
        with pytest.raises(TagNotFoundError):
            service.delete_tag(tag.id)


def test_filter_combines_category_text_and_all_selected_tags(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language, category, pronoun = create_library(session)
        flashcards = FlashcardRepository(session)
        verb = flashcards.create(
            language_id=language.id,
            category_id=category.id,
            term="verb",
            translation="verbo",
            example=None,
            notes=None,
        )
        other_category = CategoryRepository(session).create(
            language_id=language.id,
            name="Everyday",
            parent_id=None,
        )
        other = flashcards.create(
            language_id=language.id,
            category_id=other_category.id,
            term="pronoun greeting",
            translation="saludo",
            example=None,
            notes=None,
        )
        tag_service = build_service(session)
        a1 = tag_service.create_tag(language_id=language.id, name="A1")
        essential = tag_service.create_tag(language_id=language.id, name="essential")
        tag_service.update_flashcard_tags(
            flashcard_id=pronoun.id,
            tag_ids=[a1.id, essential.id],
        )
        tag_service.update_flashcard_tags(flashcard_id=verb.id, tag_ids=[a1.id])
        tag_service.update_flashcard_tags(
            flashcard_id=other.id,
            tag_ids=[a1.id, essential.id],
        )
        service = build_flashcard_service(session)

        by_translation = service.filter_flashcards(
            language_id=language.id,
            category_id=category.id,
            search="NOMBRE",
        )
        by_one_tag = service.filter_flashcards(
            language_id=language.id,
            category_id=category.id,
            tag_ids=[a1.id],
        )

        result = service.filter_flashcards(
            language_id=language.id,
            category_id=category.id,
            search=" PRON ",
            tag_ids=[a1.id, essential.id],
        )

        assert by_translation == [pronoun]
        assert by_one_tag == [pronoun, verb]
        assert result == [pronoun]


def test_filter_validates_category_and_tags_belong_to_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        norwegian, category, _ = create_library(session)
        french, french_category, _ = create_library(session, language_name="French", code="fr")
        french_tag = build_service(session).create_tag(language_id=french.id, name="débutant")
        service = build_flashcard_service(session)

        with pytest.raises(CategoryNotFoundError):
            service.filter_flashcards(language_id=norwegian.id, category_id=999)
        with pytest.raises(CategoryLanguageMismatchError):
            service.filter_flashcards(
                language_id=norwegian.id,
                category_id=french_category.id,
            )
        with pytest.raises(TagLanguageMismatchError):
            service.filter_flashcards(
                language_id=norwegian.id,
                category_id=category.id,
                tag_ids=[french_tag.id],
            )
