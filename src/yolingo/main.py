from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from yolingo.api.router import api_router
from yolingo.config import get_settings
from yolingo.database import Database

WEB_DIRECTORY = Path(__file__).parent / "web"


def create_app(database_url: str | None = None) -> FastAPI:
    database = Database(database_url or get_settings().database_url)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        yield
        database.dispose()

    app = FastAPI(
        title="yoLingo API",
        description="API for organizing and studying language vocabulary.",
        version="0.1.0",
        lifespan=lifespan,
    )
    app.state.database = database
    app.include_router(api_router, prefix="/api/v1")
    app.mount("/static", StaticFiles(directory=WEB_DIRECTORY / "static"), name="static")

    @app.get("/", include_in_schema=False)
    def index() -> FileResponse:
        return FileResponse(WEB_DIRECTORY / "index.html")

    return app


app = create_app()
