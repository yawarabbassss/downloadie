import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data
    assert "storage" in data
    assert "direct_media" in data["configured_providers"]


def test_list_providers_endpoint(client: TestClient):
    response = client.get("/api/providers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 5

    names = [p["name"] for p in data]
    assert "Instagram" in names
    assert "YouTube" in names
    assert "TikTok" in names
    assert "Facebook" in names
    assert "Direct Media & Storage" in names


def test_resolve_instagram_url(client: TestClient):
    payload = {"url": "https://www.instagram.com/reel/Cx12345ABC/"}
    response = client.post("/api/resolve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["provider"] == "instagram"
    assert data["status"] in ("requires_api_key", "active")


def test_resolve_unsupported_url(client: TestClient):
    payload = {"url": "https://unknown-random-domain-xyz.com/something"}
    response = client.post("/api/resolve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "unsupported"
    assert data["can_download"] is False


def test_create_download_platform_job(client: TestClient):
    payload = {
        "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "format_id": "best_video",
    }
    response = client.post("/api/downloads", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("pending", "processing", "ready")
    assert "job_" in data["job_id"]


def test_get_nonexistent_job(client: TestClient):
    response = client.get("/api/downloads/job_nonexistent_999")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "failed"
    assert data["error_code"] == "JOB_NOT_FOUND"
