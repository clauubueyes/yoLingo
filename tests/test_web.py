import asyncio

import httpx2
from fastapi import FastAPI


def test_home_page_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/"))

    assert response.status_code == httpx2.codes.OK
    assert "¿Qué idioma quieres practicar?" in response.text
    assert "Categorías" in response.text
    assert "Selecciona una categoría" in response.text
    assert "Nueva flashcard" in response.text
    assert "Buscar por término o traducción" in response.text
    assert "Filtrar por tags" in response.text
    assert "Nuevo tag" in response.text
    assert "Filtros activos:" in response.text
    assert "Reintentar carga de tags" in response.text
    assert '<script src="/static/study-session.js" defer></script>' in response.text
    assert "Modo estudio" in response.text
    assert "Revelar respuesta" in response.text
    assert "Abandonar sesión" in response.text
    assert "¡Sesión completada!" in response.text
    assert "No hay flashcards para estudiar." in response.text
    assert "Cargando tus idiomas…" in response.text
    assert "No pudimos cargar tus idiomas" in response.text
    assert "No pudimos cargar las categorías" in response.text
    assert 'id="retry-languages-button"' in response.text
    assert 'id="retry-categories-button"' in response.text


def test_study_session_client_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/static/study-session.js"))

    assert response.status_code == httpx2.codes.OK
    assert "class StudySession" in response.text
    assert "revealAnswer" in response.text
    assert "restart" in response.text


def test_category_client_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/static/app.js"))

    assert response.status_code == httpx2.codes.OK
    assert "loadCategories" in response.text
    assert "loadFlashcards" in response.text
    assert "loadTags" in response.text
    assert "URLSearchParams" in response.text
    assert 'query.append("tag_ids", tagId)' in response.text
    assert '`/api/v1/flashcards/${saved.id}/tags`' in response.text
    assert "renderLibraryContext" in response.text
    assert "activeFlashcardCategoryId !== categoryId" in response.text
    assert 'method: "POST"' in response.text
    assert 'method: "PUT"' in response.text
    assert '"PATCH"' in response.text
    assert 'method: "DELETE"' in response.text
    assert "startStudy" in response.text
    assert "renderStudySession" in response.text
    assert "/study-flashcards" in response.text
    assert "studySession.restart()" in response.text
    assert "new AbortController()" in response.text
    assert "currentFlashcardQuery() !== queryString" in response.text
    assert "response.status >= 500" in response.text
    assert "No hay flashcards con todos esos tags" in response.text
    assert "No hay coincidencias para" in response.text
    assert "Has abandonado la sesión de estudio." in response.text
    assert 'submitButton.textContent = "Guardando…"' in response.text


async def get_response(app: FastAPI, path: str) -> httpx2.Response:
    transport = httpx2.ASGITransport(app=app)
    async with httpx2.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get(path)
