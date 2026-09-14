from fastapi import APIRouter

from yolingo.api.routes.categories import router as categories_router
from yolingo.api.routes.flashcards import router as flashcards_router
from yolingo.api.routes.health import router as health_router
from yolingo.api.routes.languages import router as languages_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(languages_router)
api_router.include_router(categories_router)
api_router.include_router(flashcards_router)
