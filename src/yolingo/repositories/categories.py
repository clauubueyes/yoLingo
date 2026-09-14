from sqlalchemy import func, select
from sqlalchemy.orm import Session

from yolingo.models.category import Category


class CategoryRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_by_language(self, language_id: int) -> list[Category]:
        statement = (
            select(Category)
            .where(Category.language_id == language_id)
            .order_by(func.lower(Category.name), Category.id)
        )
        return list(self._session.scalars(statement))

    def get_by_id(self, category_id: int) -> Category | None:
        return self._session.get(Category, category_id)

    def name_exists(self, *, language_id: int, parent_id: int | None, name: str) -> bool:
        statement = select(Category.id).where(
            Category.language_id == language_id,
            Category.name == name,
        )
        if parent_id is None:
            statement = statement.where(Category.parent_id.is_(None))
        else:
            statement = statement.where(Category.parent_id == parent_id)
        return self._session.scalar(statement.limit(1)) is not None

    def create(self, *, language_id: int, name: str, parent_id: int | None) -> Category:
        category = Category(language_id=language_id, name=name, parent_id=parent_id)
        self._session.add(category)
        self._session.commit()
        self._session.refresh(category)
        return category

    def delete(self, category_id: int) -> bool:
        category = self._session.get(Category, category_id)
        if category is None:
            return False

        self._session.delete(category)
        self._session.commit()
        return True
