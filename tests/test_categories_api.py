import asyncio
from typing import Any

import httpx2
from fastapi import FastAPI


def test_user_can_create_and_list_root_categories_and_subcategories(app: FastAPI) -> None:
    language_id = create_language(app, name="Norwegian", code="nb")

    root = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{language_id}/categories",
            json={"name": "Everyday"},
        )
    )
    child = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{language_id}/categories",
            json={"name": "Greetings", "parent_id": root.json()["id"]},
        )
    )

    assert root.status_code == httpx2.codes.CREATED
    assert root.json()["parent_id"] is None
    assert child.status_code == httpx2.codes.CREATED
    assert child.json()["parent_id"] == root.json()["id"]

    listed = asyncio.run(
        request(app, "GET", f"/api/v1/languages/{language_id}/categories")
    )

    assert listed.status_code == httpx2.codes.OK
    assert [(item["name"], item["parent_id"]) for item in listed.json()] == [
        ("Everyday", None),
        ("Greetings", root.json()["id"]),
    ]


def test_user_can_delete_a_category(app: FastAPI) -> None:
    language_id = create_language(app, name="Norwegian", code="nb")
    category = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{language_id}/categories",
            json={"name": "Everyday"},
        )
    )

    deleted = asyncio.run(
        request(
            app,
            "DELETE",
            f"/api/v1/languages/{language_id}/categories/{category.json()['id']}",
        )
    )

    assert deleted.status_code == httpx2.codes.NO_CONTENT
    listed = asyncio.run(
        request(app, "GET", f"/api/v1/languages/{language_id}/categories")
    )
    assert listed.json() == []


def test_category_endpoints_require_an_existing_language(app: FastAPI) -> None:
    listed = asyncio.run(request(app, "GET", "/api/v1/languages/999/categories"))
    created = asyncio.run(
        request(
            app,
            "POST",
            "/api/v1/languages/999/categories",
            json={"name": "Everyday"},
        )
    )

    assert listed.status_code == httpx2.codes.NOT_FOUND
    assert listed.json() == {"detail": "El idioma no existe."}
    assert created.status_code == httpx2.codes.NOT_FOUND


def test_duplicate_category_returns_a_conflict(app: FastAPI) -> None:
    language_id = create_language(app, name="Norwegian", code="nb")
    path = f"/api/v1/languages/{language_id}/categories"
    asyncio.run(request(app, "POST", path, json={"name": "Everyday"}))

    duplicate = asyncio.run(request(app, "POST", path, json={"name": "everyday"}))

    assert duplicate.status_code == httpx2.codes.CONFLICT
    assert duplicate.json() == {
        "detail": "Ya existe una categoría con ese nombre en el mismo nivel."
    }


def test_parent_must_exist_in_the_same_language(app: FastAPI) -> None:
    norwegian_id = create_language(app, name="Norwegian", code="nb")
    french_id = create_language(app, name="French", code="fr")
    french_parent = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{french_id}/categories",
            json={"name": "Quotidien"},
        )
    )

    missing = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{norwegian_id}/categories",
            json={"name": "Greetings", "parent_id": 999},
        )
    )
    other_language = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{norwegian_id}/categories",
            json={"name": "Greetings", "parent_id": french_parent.json()["id"]},
        )
    )

    assert missing.status_code == httpx2.codes.NOT_FOUND
    assert other_language.status_code == httpx2.codes.UNPROCESSABLE_CONTENT
    assert other_language.json() == {"detail": "La categoría padre pertenece a otro idioma."}


def test_subcategory_cannot_have_children(app: FastAPI) -> None:
    language_id = create_language(app, name="Norwegian", code="nb")
    path = f"/api/v1/languages/{language_id}/categories"
    root = asyncio.run(request(app, "POST", path, json={"name": "Everyday"}))
    child = asyncio.run(
        request(
            app,
            "POST",
            path,
            json={"name": "Greetings", "parent_id": root.json()["id"]},
        )
    )

    third_level = asyncio.run(
        request(
            app,
            "POST",
            path,
            json={"name": "Formal", "parent_id": child.json()["id"]},
        )
    )

    assert third_level.status_code == httpx2.codes.UNPROCESSABLE_CONTENT
    assert third_level.json() == {
        "detail": "No se pueden crear categorías con más de dos niveles."
    }


def test_blank_category_name_is_rejected(app: FastAPI) -> None:
    language_id = create_language(app, name="Norwegian", code="nb")

    response = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{language_id}/categories",
            json={"name": "   "},
        )
    )

    assert response.status_code == httpx2.codes.UNPROCESSABLE_CONTENT


def test_delete_unknown_category_returns_not_found(app: FastAPI) -> None:
    language_id = create_language(app, name="Norwegian", code="nb")

    response = asyncio.run(
        request(app, "DELETE", f"/api/v1/languages/{language_id}/categories/999")
    )

    assert response.status_code == httpx2.codes.NOT_FOUND
    assert response.json() == {"detail": "La categoría no existe en este idioma."}


def create_language(app: FastAPI, *, name: str, code: str) -> int:
    response = asyncio.run(
        request(
            app,
            "POST",
            "/api/v1/languages",
            json={"name": name, "code": code, "flag": None},
        )
    )
    assert response.status_code == httpx2.codes.CREATED
    return response.json()["id"]


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
