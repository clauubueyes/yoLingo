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


def test_category_client_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/static/app.js"))

    assert response.status_code == httpx2.codes.OK
    assert "loadCategories" in response.text
    assert "loadFlashcards" in response.text
    assert "loadTags" in response.text
    assert "URLSearchParams" in response.text
    assert 'query.append("tag_ids", tagId)' in response.text
    assert '`/api/v1/flashcards/${saved.id}/tags`' in response.text
    assert 'method: "POST"' in response.text
    assert 'method: "PUT"' in response.text
    assert '"PATCH"' in response.text
    assert 'method: "DELETE"' in response.text


async def get_response(app: FastAPI, path: str) -> httpx2.Response:
    transport = httpx2.ASGITransport(app=app)
    async with httpx2.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get(path)
