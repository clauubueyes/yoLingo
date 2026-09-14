import pytest
from fastapi import FastAPI
from sqlalchemy.orm import Session

from yolingo.exceptions import (
    CategoryAlreadyExistsError,
    CategoryNestingLimitError,
    CategoryNotFoundError,
    CategoryParentLanguageMismatchError,
    InvalidCategoryNameError,
    LanguageNotFoundError,
)
from yolingo.repositories.categories import CategoryRepository
from yolingo.repositories.languages import LanguageRepository
from yolingo.services.categories import CategoryService


def build_service(session: Session) -> CategoryService:
    return CategoryService(CategoryRepository(session), LanguageRepository(session))


def create_language(session: Session, *, name: str = "Norwegian", code: str = "nb") -> int:
    return LanguageRepository(session).create(name=name, code=code, flag=None).id


def test_create_root_and_subcategory_normalizes_their_names(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id = create_language(session)
        service = build_service(session)

        root = service.create_category(language_id=language_id, name="  Everyday  ")
        child = service.create_category(
            language_id=language_id,
            name="  Greetings  ",
            parent_id=root.id,
        )

        assert root.name == "Everyday"
        assert root.parent_id is None
        assert child.name == "Greetings"
        assert child.parent_id == root.id


def test_list_categories_requires_an_existing_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session, pytest.raises(LanguageNotFoundError):
        build_service(session).list_categories(999)


@pytest.mark.parametrize("name", ["", "   ", "a" * 81])
def test_create_category_rejects_invalid_names(app: FastAPI, name: str) -> None:
    with Session(app.state.database.engine) as session:
        language_id = create_language(session)

        with pytest.raises(InvalidCategoryNameError):
            build_service(session).create_category(language_id=language_id, name=name)


def test_create_category_requires_an_existing_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session, pytest.raises(LanguageNotFoundError):
        build_service(session).create_category(language_id=999, name="Everyday")


def test_parent_must_exist(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id = create_language(session)

        with pytest.raises(CategoryNotFoundError):
            build_service(session).create_category(
                language_id=language_id,
                name="Greetings",
                parent_id=999,
            )


def test_parent_must_belong_to_the_same_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        norwegian_id = create_language(session)
        french_id = create_language(session, name="French", code="fr")
        service = build_service(session)
        french_parent = service.create_category(language_id=french_id, name="Quotidien")

        with pytest.raises(CategoryParentLanguageMismatchError):
            service.create_category(
                language_id=norwegian_id,
                name="Greetings",
                parent_id=french_parent.id,
            )


def test_subcategory_cannot_be_the_parent_of_another_category(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id = create_language(session)
        service = build_service(session)
        root = service.create_category(language_id=language_id, name="Everyday")
        child = service.create_category(
            language_id=language_id,
            name="Greetings",
            parent_id=root.id,
        )

        with pytest.raises(CategoryNestingLimitError):
            service.create_category(
                language_id=language_id,
                name="Formal",
                parent_id=child.id,
            )


def test_names_must_be_unique_within_the_same_parent_ignoring_case(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id = create_language(session)
        service = build_service(session)
        first_parent = service.create_category(language_id=language_id, name="Everyday")
        second_parent = service.create_category(language_id=language_id, name="Grammar")
        service.create_category(
            language_id=language_id,
            name="Greetings",
            parent_id=first_parent.id,
        )

        with pytest.raises(CategoryAlreadyExistsError):
            service.create_category(
                language_id=language_id,
                name="greetings",
                parent_id=first_parent.id,
            )

        same_name_other_level = service.create_category(
            language_id=language_id,
            name="Greetings",
        )
        same_name_other_parent = service.create_category(
            language_id=language_id,
            name="Greetings",
            parent_id=second_parent.id,
        )

        assert same_name_other_level.id is not None
        assert same_name_other_parent.id is not None


def test_root_names_must_be_unique_ignoring_case(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id = create_language(session)
        service = build_service(session)
        service.create_category(language_id=language_id, name="Everyday")

        with pytest.raises(CategoryAlreadyExistsError):
            service.create_category(language_id=language_id, name="everyday")


def test_delete_category_requires_it_to_belong_to_the_language(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        norwegian_id = create_language(session)
        french_id = create_language(session, name="French", code="fr")
        service = build_service(session)
        category = service.create_category(language_id=french_id, name="Quotidien")

        with pytest.raises(CategoryNotFoundError):
            service.delete_category(language_id=norwegian_id, category_id=category.id)


def test_delete_category_removes_it(app: FastAPI) -> None:
    with Session(app.state.database.engine) as session:
        language_id = create_language(session)
        service = build_service(session)
        category = service.create_category(language_id=language_id, name="Everyday")

        service.delete_category(language_id=language_id, category_id=category.id)

        assert service.list_categories(language_id) == []
