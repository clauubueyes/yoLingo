from fastapi import FastAPI

from yolingo.api.router import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title="yoLingo API",
        description="API for organizing and studying language vocabulary.",
        version="0.1.0",
    )
    app.include_router(api_router, prefix="/api/v1")
    return app


app = create_app()
