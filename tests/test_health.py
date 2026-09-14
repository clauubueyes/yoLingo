import asyncio

import httpx2
from fastapi import FastAPI


def test_health_check_returns_ok(app: FastAPI) -> None:
    response = asyncio.run(get_response(app, "/api/v1/health"))

    assert response.status_code == httpx2.codes.OK
    assert response.json() == {"status": "ok"}


async def get_response(app: FastAPI, path: str) -> httpx2.Response:
    transport = httpx2.ASGITransport(app=app)
    async with httpx2.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get(path)
