import asyncio

import httpx2
from fastapi import FastAPI


def test_home_page_is_available(app: FastAPI) -> None:
    response = asyncio.run(get_home_page(app))

    assert response.status_code == httpx2.codes.OK
    assert "¿Qué idioma quieres practicar?" in response.text


async def get_home_page(app: FastAPI) -> httpx2.Response:
    transport = httpx2.ASGITransport(app=app)
    async with httpx2.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get("/")
