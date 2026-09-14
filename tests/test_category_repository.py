import pytest
from fastapi import FastAPI
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.languages import LanguageRepository


def test_list_categories_only_returns_categories_for_the_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        languages = LanguageRepository(session)
        norwegian = languages.create(name="Norwegian", code="nb", flag=None)
        french = languages.create(name="French", code="fr", flag=None)
        categories = CategoryRepository(session)
        categories.create(language_id=norwegian.id, name="Grammar", parent_id=None)
        everyday = categories.create(
            language_id=norwegian.id,
            name="Everyday",
            parent_id=None,
        )
        categories.create(
            language_id=norwegian.id,
            name="Greetings",
            parent_id=everyday.id,
        )
        categories.create(language_id=french.id, name="Voyage", parent_id=None)

        result = categories.list_by_language(norwegian.id)

        assert [(category.name, category.parent_id) for category in result] == [
            ("Everyday", None),
            ("Grammar", None),
            ("Greetings", everyday.id),
        ]


def test_create_category_persists_its_language_parent_and_timestamps(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language = LanguageRepository(session).create(name="Norwegian", code="nb", flag=None)
        categories = CategoryRepository(session)
        parent = categories.create(language_id=language.id, name="Everyday", parent_id=None)

        category = categories.create(
            language_id=language.id,
            name="Greetings",
            parent_id=parent.id,
        )

        assert category.id is not None
        assert category.language_id == language.id
        assert category.parent_id == parent.id
        assert category.created_at is not None
        assert category.updated_at is not None


def test_delete_category_removes_it_and_its_children(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language = LanguageRepository(session).create(name="Norwegian", code="nb", flag=None)
        categories = CategoryRepository(session)
        parent = categories.create(language_id=language.id, name="Everyday", parent_id=None)
        child = categories.create(
            language_id=language.id,
            name="Greetings",
            parent_id=parent.id,
        )

        deleted = categories.delete(parent.id)

        assert deleted is True
        assert session.get(type(parent), parent.id) is None
        assert session.get(type(child), child.id) is None


def test_delete_category_returns_false_when_it_does_not_exist(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        assert CategoryRepository(session).delete(999) is False


def test_category_foreign_keys_are_enforced_and_the_session_recovers(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        categories = CategoryRepository(session)

        with pytest.raises(IntegrityError):
            categories.create(language_id=999, name="Orphan", parent_id=None)

        language = LanguageRepository(session).create(name="Norwegian", code="nb", flag=None)
        category = categories.create(language_id=language.id, name="Everyday", parent_id=None)

        assert category.language_id == language.id
