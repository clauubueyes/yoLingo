from collections.abc import Generator

import pytest
from fastapi import FastAPI

from yolingo.database import Base
from yolingo.main import create_app


@pytest.fixture
def app(tmp_path) -> Generator[FastAPI]:
    application = create_app(f"sqlite:///{tmp_path / 'test.db'}")
    Base.metadata.create_all(application.state.database.engine)
    yield application
    application.state.database.dispose()
