import asyncio
from typing import Any

import httpx2
from fastapi import FastAPI


def test_user_can_create_list_and_get_a_flashcard(app: FastAPI) -> None:
    language_id, category_id = create_language_and_category(app)
    path = flashcard_collection_path(language_id, category_id)

    created = asyncio.run(
        request(
            app,
            "POST",
            path,
            json={
                "term": "hello",
                "translation": "hola",
                "example": "Hello, how are you?",
                "notes": None,
            },
        )
    )

    assert created.status_code == httpx2.codes.CREATED
    assert created.json()["category_id"] == category_id

    listed = asyncio.run(request(app, "GET", path))
    found = asyncio.run(request(app, "GET", f"/api/v1/flashcards/{created.json()['id']}"))

    assert listed.status_code == httpx2.codes.OK
    assert [item["term"] for item in listed.json()] == ["hello"]
    assert found.status_code == httpx2.codes.OK
    assert found.json() == created.json()


def test_user_can_partially_update_and_clear_optional_content(app: FastAPI) -> None:
    language_id, category_id = create_language_and_category(app)
    created = create_flashcard(app, language_id, category_id)

    updated = asyncio.run(
        request(
            app,
            "PATCH",
            f"/api/v1/flashcards/{created['id']}",
            json={"translation": "buenas", "example": None},
        )
    )

    assert updated.status_code == httpx2.codes.OK
    assert updated.json()["term"] == "hello"
    assert updated.json()["translation"] == "buenas"
    assert updated.json()["example"] is None
    assert updated.json()["notes"] == "Informal greeting"


def test_user_can_delete_a_flashcard(app: FastAPI) -> None:
    language_id, category_id = create_language_and_category(app)
    created = create_flashcard(app, language_id, category_id)

    deleted = asyncio.run(
        request(app, "DELETE", f"/api/v1/flashcards/{created['id']}")
    )
    found = asyncio.run(request(app, "GET", f"/api/v1/flashcards/{created['id']}"))

    assert deleted.status_code == httpx2.codes.NO_CONTENT
    assert found.status_code == httpx2.codes.NOT_FOUND


def test_category_must_exist_and_belong_to_the_language(app: FastAPI) -> None:
    norwegian_id, _ = create_language_and_category(app)
    french_id, french_category_id = create_language_and_category(
        app,
        language_name="French",
        code="fr",
        category_name="Salutations",
    )

    missing = asyncio.run(
        request(
            app,
            "POST",
            flashcard_collection_path(norwegian_id, 999),
            json={"term": "hello", "translation": "hola"},
        )
    )
    other_language = asyncio.run(
        request(
            app,
            "GET",
            flashcard_collection_path(norwegian_id, french_category_id),
        )
    )

    assert french_id != norwegian_id
    assert missing.status_code == httpx2.codes.NOT_FOUND
    assert other_language.status_code == httpx2.codes.UNPROCESSABLE_CONTENT
    assert other_language.json() == {"detail": "La categoría pertenece a otro idioma."}


def test_flashcard_collection_requires_an_existing_language(app: FastAPI) -> None:
    response = asyncio.run(
        request(app, "GET", flashcard_collection_path(language_id=999, category_id=999))
    )

    assert response.status_code == httpx2.codes.NOT_FOUND
    assert response.json() == {"detail": "El idioma no existe."}


def test_required_flashcard_content_cannot_be_empty(app: FastAPI) -> None:
    language_id, category_id = create_language_and_category(app)
    path = flashcard_collection_path(language_id, category_id)

    empty_term = asyncio.run(
        request(app, "POST", path, json={"term": "   ", "translation": "hola"})
    )
    empty_translation = asyncio.run(
        request(app, "POST", path, json={"term": "hello", "translation": "   "})
    )

    assert empty_term.status_code == httpx2.codes.UNPROCESSABLE_CONTENT
    assert empty_translation.status_code == httpx2.codes.UNPROCESSABLE_CONTENT


def test_empty_patch_and_null_required_content_are_rejected(app: FastAPI) -> None:
    language_id, category_id = create_language_and_category(app)
    created = create_flashcard(app, language_id, category_id)
    path = f"/api/v1/flashcards/{created['id']}"

    empty_patch = asyncio.run(request(app, "PATCH", path, json={}))
    null_term = asyncio.run(request(app, "PATCH", path, json={"term": None}))

    assert empty_patch.status_code == httpx2.codes.UNPROCESSABLE_CONTENT
    assert null_term.status_code == httpx2.codes.UNPROCESSABLE_CONTENT


def test_duplicate_flashcard_returns_a_conflict(app: FastAPI) -> None:
    language_id, category_id = create_language_and_category(app)
    path = flashcard_collection_path(language_id, category_id)
    create_flashcard(app, language_id, category_id)

    duplicate = asyncio.run(
        request(app, "POST", path, json={"term": "hello", "translation": "hola"})
    )

    assert duplicate.status_code == httpx2.codes.CONFLICT
    assert duplicate.json() == {
        "detail": "Ya existe una flashcard con ese término y traducción en la categoría."
    }


def test_unknown_flashcard_returns_not_found_for_item_operations(app: FastAPI) -> None:
    found = asyncio.run(request(app, "GET", "/api/v1/flashcards/999"))
    updated = asyncio.run(
        request(app, "PATCH", "/api/v1/flashcards/999", json={"term": "hello"})
    )
    deleted = asyncio.run(request(app, "DELETE", "/api/v1/flashcards/999"))

    assert found.status_code == httpx2.codes.NOT_FOUND
    assert updated.status_code == httpx2.codes.NOT_FOUND
    assert deleted.status_code == httpx2.codes.NOT_FOUND


def create_language_and_category(
    app: FastAPI,
    *,
    language_name: str = "Norwegian",
    code: str = "nb",
    category_name: str = "Greetings",
) -> tuple[int, int]:
    language = asyncio.run(
        request(
            app,
            "POST",
            "/api/v1/languages",
            json={"name": language_name, "code": code, "flag": None},
        )
    ).json()
    category = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{language['id']}/categories",
            json={"name": category_name},
        )
    ).json()
    return language["id"], category["id"]


def create_flashcard(app: FastAPI, language_id: int, category_id: int) -> dict[str, Any]:
    response = asyncio.run(
        request(
            app,
            "POST",
            flashcard_collection_path(language_id, category_id),
            json={
                "term": "hello",
                "translation": "hola",
                "example": "Hello, how are you?",
                "notes": "Informal greeting",
            },
        )
    )
    assert response.status_code == httpx2.codes.CREATED
    return response.json()


def flashcard_collection_path(language_id: int, category_id: int) -> str:
    return f"/api/v1/languages/{language_id}/categories/{category_id}/flashcards"


async def request(
    app: FastAPI,
    method: str,
    path: str,
    *,
    json: dict[str, Any] | None = None,
) -> httpx2.Response:
    transport = httpx2.ASGITransport(app=app)
    async with httpx2.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.request(method, path, json=json)
