import asyncio
from typing import Any

import httpx2
from fastapi import FastAPI


def test_study_selection_is_limited_to_the_selected_category(app: FastAPI) -> None:
    language_id, greetings_id = create_library(app)
    everyday_id = create_category(app, language_id, "Everyday")
    greeting = create_flashcard(app, language_id, greetings_id, "god dag", "buenos días")
    create_flashcard(app, language_id, everyday_id, "takk", "gracias")

    response = asyncio.run(request(app, "GET", study_path(language_id, greetings_id)))

    assert response.status_code == httpx2.codes.OK
    assert response.json() == [study_content(greeting)]


def test_study_selection_respects_search(app: FastAPI) -> None:
    language_id, category_id = create_library(app)
    morning = create_flashcard(
        app,
        language_id,
        category_id,
        "god morgen",
        "buenos días",
    )
    create_flashcard(app, language_id, category_id, "god natt", "buenas noches")

    response = asyncio.run(
        request(app, "GET", f"{study_path(language_id, category_id)}?search=DÍAS")
    )

    assert response.json() == [study_content(morning)]


def test_study_selection_requires_all_selected_tags(app: FastAPI) -> None:
    language_id, category_id = create_library(app)
    morning = create_flashcard(app, language_id, category_id, "god morgen", "buenos días")
    night = create_flashcard(app, language_id, category_id, "god natt", "buenas noches")
    a1 = create_tag(app, language_id, "A1")
    essential = create_tag(app, language_id, "essential")
    update_tags(app, morning["id"], [a1["id"], essential["id"]])
    update_tags(app, night["id"], [a1["id"]])

    response = asyncio.run(
        request(
            app,
            "GET",
            (
                f"{study_path(language_id, category_id)}"
                f"?tag_ids={a1['id']}&tag_ids={essential['id']}"
            ),
        )
    )

    assert response.json() == [study_content(morning)]


def test_study_selection_combines_category_search_and_tags(app: FastAPI) -> None:
    language_id, greetings_id = create_library(app)
    other_category_id = create_category(app, language_id, "Other")
    selected = create_flashcard(app, language_id, greetings_id, "god morgen", "buenos días")
    same_category = create_flashcard(app, language_id, greetings_id, "god natt", "buenas noches")
    other_category = create_flashcard(
        app,
        language_id,
        other_category_id,
        "morgen",
        "mañana",
    )
    a1 = create_tag(app, language_id, "A1")
    essential = create_tag(app, language_id, "essential")
    update_tags(app, selected["id"], [a1["id"], essential["id"]])
    update_tags(app, same_category["id"], [a1["id"], essential["id"]])
    update_tags(app, other_category["id"], [a1["id"], essential["id"]])

    response = asyncio.run(
        request(
            app,
            "GET",
            (
                f"{study_path(language_id, greetings_id)}?search=morgen"
                f"&tag_ids={a1['id']}&tag_ids={essential['id']}"
            ),
        )
    )

    assert response.json() == [study_content(selected)]


def test_study_selection_can_be_empty(app: FastAPI) -> None:
    language_id, category_id = create_library(app)
    create_flashcard(app, language_id, category_id, "god dag", "buenos días")

    response = asyncio.run(
        request(app, "GET", f"{study_path(language_id, category_id)}?search=missing")
    )

    assert response.status_code == httpx2.codes.OK
    assert response.json() == []


def create_library(app: FastAPI) -> tuple[int, int]:
    language = asyncio.run(
        request(
            app,
            "POST",
            "/api/v1/languages",
            json={"name": "Norwegian", "code": "nb", "flag": None},
        )
    ).json()
    return language["id"], create_category(app, language["id"], "Greetings")


def create_category(app: FastAPI, language_id: int, name: str) -> int:
    response = asyncio.run(
        request(
            app,
            "POST",
            f"/api/v1/languages/{language_id}/categories",
            json={"name": name},
        )
    )
    assert response.status_code == httpx2.codes.CREATED
    return response.json()["id"]


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
            f"/api/v1/languages/{language_id}/categories/{category_id}/flashcards",
            json={
                "term": term,
                "translation": translation,
                "example": f"Example for {term}",
                "notes": f"Notes for {term}",
            },
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


def study_path(language_id: int, category_id: int) -> str:
    return f"/api/v1/languages/{language_id}/categories/{category_id}/study-flashcards"


def study_content(flashcard: dict[str, Any]) -> dict[str, Any]:
    return {
        "term": flashcard["term"],
        "translation": flashcard["translation"],
        "example": flashcard["example"],
        "notes": flashcard["notes"],
    }


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
