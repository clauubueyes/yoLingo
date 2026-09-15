import asyncio
from typing import Any

import httpx2
import pytest
from fastapi import FastAPI


def test_user_can_create_and_list_a_language(app: FastAPI) -> None:
    created = asyncio.run(
        request(
            app,
            "POST",
            "/api/v1/languages",
            json={"name": "Norwegian", "code": "NB", "flag": "🇳🇴"},
        )
    )

    assert created.status_code == httpx2.codes.CREATED
    assert created.json()["name"] == "Norwegian"
    assert created.json()["code"] == "nb"

    listed = asyncio.run(request(app, "GET", "/api/v1/languages"))

    assert listed.status_code == httpx2.codes.OK
    assert [(item["name"], item["code"]) for item in listed.json()] == [
        ("Norwegian", "nb")
    ]


@pytest.mark.parametrize(
    "duplicate_payload",
    [
        {"name": "norwegian", "code": "nn", "flag": None},
        {"name": "Norsk", "code": "NB", "flag": None},
    ],
)
def test_duplicate_language_name_or_code_returns_a_conflict(
    app: FastAPI,
    duplicate_payload: dict[str, Any],
) -> None:
    payload = {"name": "Norwegian", "code": "nb", "flag": "🇳🇴"}
    asyncio.run(request(app, "POST", "/api/v1/languages", json=payload))

    duplicate = asyncio.run(
        request(app, "POST", "/api/v1/languages", json=duplicate_payload)
    )

    assert duplicate.status_code == httpx2.codes.CONFLICT
    assert duplicate.json() == {"detail": "Ya existe un idioma con ese nombre o código."}


def test_blank_language_name_is_rejected(app: FastAPI) -> None:
    response = asyncio.run(
        request(
            app,
            "POST",
            "/api/v1/languages",
            json={"name": "   ", "code": "nb", "flag": None},
        )
    )

    assert response.status_code == httpx2.codes.UNPROCESSABLE_CONTENT


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
