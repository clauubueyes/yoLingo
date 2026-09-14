import asyncio

import httpx2

from yolingo.main import create_app


def test_health_check_returns_ok() -> None:
    response = asyncio.run(get_health_response())

    assert response.status_code == httpx2.codes.OK
    assert response.json() == {"status": "ok"}


async def get_health_response() -> httpx2.Response:
    transport = httpx2.ASGITransport(app=create_app())
    async with httpx2.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get("/api/v1/health")
