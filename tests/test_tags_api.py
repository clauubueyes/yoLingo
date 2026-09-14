import asyncio
from typing import Any

import httpx2
from fastapi import FastAPI


def test_user_can_create_list_and_delete_tags(app: FastAPI) -> None:
    language_id, _ = create_library(app)
    path = f"/api/v1/languages/{language_id}/tags"

    essential = asyncio.run(request(app, "POST", path, json={"name": "essential"}))
    asyncio.run(request(app, "POST", path, json={"name": "A1"}))
    listed = asyncio.run(request(app, "GET", path))

    assert essential.status_code == httpx2.codes.CREATED
    assert [tag["name"] for tag in listed.json()] == ["A1", "essential"]

    deleted = asyncio.run(request(app, "DELETE", f"/api/v1/tags/{essential.json()['id']}"))

    assert deleted.status_code == httpx2.codes.NO_CONTENT
    assert [tag["name"] for tag in asyncio.run(request(app, "GET", path)).json()] == ["A1"]


def test_tag_input_and_language_are_validated(app: FastAPI) -> None:
    language_id, _ = create_library(app)
    path = f"/api/v1/languages/{language_id}/tags"
    asyncio.run(request(app, "POST", path, json={"name": "essential"}))

    duplicate = asyncio.run(request(app, "POST", path, json={"name": "ESSENTIAL"}))
    blank = asyncio.run(request(app, "POST", path, json={"name": "   "}))
    missing_language = asyncio.run(request(app, "GET", "/api/v1/languages/999/tags"))

    assert duplicate.status_code == httpx2.codes.CONFLICT
    assert blank.status_code == httpx2.codes.UNPROCESSABLE_CONTENT
    assert missing_language.status_code == httpx2.codes.NOT_FOUND


def test_user_can_update_get_and_remove_flashcard_tags(app: FastAPI) -> None:
    language_id, category_id = create_library(app)
    flashcard = create_flashcard(app, language_id, category_id, "hello", "hola")
    a1 = create_tag(app, language_id, "A1")
    essential = create_tag(app, language_id, "essential")
    path = f"/api/v1/flashcards/{flashcard['id']}/tags"

    updated = asyncio.run(
        request(
            app,
            "PUT",
            path,
            json={"tag_ids": [essential["id"], a1["id"], essential["id"]]},
        )
    )
    found = asyncio.run(request(app, "GET", path))
    flashcard_response = asyncio.run(
        request(app, "GET", f"/api/v1/flashcards/{flashcard['id']}")
    )

    assert [tag["name"] for tag in updated.json()] == ["A1", "essential"]
    assert found.json() == updated.json()
    assert flashcard_response.json()["tags"] == updated.json()

    removed = asyncio.run(
        request(app, "DELETE", f"{path}/{essential['id']}")
    )

    assert removed.status_code == httpx2.codes.NO_CONTENT
    assert [tag["name"] for tag in asyncio.run(request(app, "GET", path)).json()] == ["A1"]
    cleared = asyncio.run(request(app, "PUT", path, json={"tag_ids": []}))
    assert cleared.json() == []


def test_tag_from_another_language_cannot_be_assigned(app: FastAPI) -> None:
    norwegian_id, category_id = create_library(app)
    french_id, _ = create_library(app, language_name="French", code="fr")
    flashcard = create_flashcard(app, norwegian_id, category_id, "hello", "hola")
    french_tag = create_tag(app, french_id, "débutant")

    response = asyncio.run(
        request(
            app,
            "PUT",
            f"/api/v1/flashcards/{flashcard['id']}/tags",
            json={"tag_ids": [french_tag["id"]]},
        )
    )

    assert response.status_code == httpx2.codes.UNPROCESSABLE_CONTENT
    assert response.json() == {"detail": "El tag pertenece a otro idioma."}


def test_flashcard_filter_combines_text_and_all_tags(app: FastAPI) -> None:
    language_id, category_id = create_library(app)
    path = collection_path(language_id, category_id)
    pronoun = create_flashcard(app, language_id, category_id, "pronoun", "pronombre")
    verb = create_flashcard(app, language_id, category_id, "verb", "verbo")
    a1 = create_tag(app, language_id, "A1")
    essential = create_tag(app, language_id, "essential")
    update_tags(app, pronoun["id"], [a1["id"], essential["id"]])
    update_tags(app, verb["id"], [a1["id"]])

    filtered = asyncio.run(
        request(
            app,
            "GET",
            f"{path}?search=NOMBRE&tag_ids={a1['id']}&tag_ids={essential['id']}",
        )
    )
    one_tag = asyncio.run(request(app, "GET", f"{path}?tag_ids={a1['id']}"))

    assert filtered.status_code == httpx2.codes.OK
    assert [item["id"] for item in filtered.json()] == [pronoun["id"]]
    assert [item["id"] for item in one_tag.json()] == [pronoun["id"], verb["id"]]


def test_deleting_tag_removes_it_from_flashcard_responses(app: FastAPI) -> None:
    language_id, category_id = create_library(app)
    flashcard = create_flashcard(app, language_id, category_id, "hello", "hola")
    tag = create_tag(app, language_id, "essential")
    update_tags(app, flashcard["id"], [tag["id"]])

    asyncio.run(request(app, "DELETE", f"/api/v1/tags/{tag['id']}"))
    found = asyncio.run(request(app, "GET", f"/api/v1/flashcards/{flashcard['id']}"))

    assert found.status_code == httpx2.codes.OK
    assert found.json()["tags"] == []


def test_tag_endpoints_reject_unknown_ids(app: FastAPI) -> None:
    missing_flashcard = asyncio.run(request(app, "GET", "/api/v1/flashcards/999/tags"))
    missing_tag = asyncio.run(request(app, "DELETE", "/api/v1/tags/999"))

    assert missing_flashcard.status_code == httpx2.codes.NOT_FOUND
    assert missing_tag.status_code == httpx2.codes.NOT_FOUND


def test_flashcard_filter_validates_tag_ids(app: FastAPI) -> None:
    language_id, category_id = create_library(app)
    path = collection_path(language_id, category_id)

    missing = asyncio.run(request(app, "GET", f"{path}?tag_ids=999"))
    invalid = asyncio.run(request(app, "GET", f"{path}?tag_ids=0"))

    assert missing.status_code == httpx2.codes.NOT_FOUND
    assert invalid.status_code == httpx2.codes.UNPROCESSABLE_CONTENT


def create_library(
    app: FastAPI,
    *,
    language_name: str = "Norwegian",
    code: str = "nb",
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
            json={"name": "Grammar"},
        )
    ).json()
    return language["id"], category["id"]


def create_flashcard(
    app: FastAPI,
    language_id: int,
    category_id: int,
    term: str,
    translation: str,
) -> dict[str, Any]:
    response = asyncio.run(
        request(
            app,
            "POST",
            collection_path(language_id, category_id),
            json={"term": term, "translation": translation},
        )
    )
    assert response.status_code == httpx2.codes.CREATED
    return response.json()


def create_tag(app: FastAPI, language_id: int, name: str) -> dict[str, Any]:
    response = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{language_id}/tags",
            json={"name": name},
        )
    )
    assert response.status_code == httpx2.codes.CREATED
    return response.json()


def update_tags(app: FastAPI, flashcard_id: int, tag_ids: list[int]) -> None:
    response = asyncio.run(
        request(
            app,
            "PUT",
            f"/api/v1/flashcards/{flashcard_id}/tags",
            json={"tag_ids": tag_ids},
        )
    )
    assert response.status_code == httpx2.codes.OK


def collection_path(language_id: int, category_id: int) -> str:
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
