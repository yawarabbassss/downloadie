import os
import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, Response

from app.core.config import settings
from app.core.security import generate_download_token, verify_download_token
from app.models.schemas import JobStatus, MediaType, ProviderType
from app.services.orchestrator import orchestrator
from app.services.storage import storage_manager


def test_token_generation_and_verification():
    job_id = "test_job_123"
    secret = "test_secret_key"
    expires_at = 2000000000  # far future timestamp

    token = generate_download_token(job_id, secret, expires_at)
    assert verify_download_token(job_id, token, secret) is True

    # Tampered job_id
    assert verify_download_token("tampered_job", token, secret) is False

    # Tampered secret
    assert verify_download_token(job_id, token, "wrong_secret") is False

    # Expired timestamp
    expired_token = generate_download_token(job_id, secret, 1000)
    assert verify_download_token(job_id, expired_token, secret) is False


def test_storage_manager_lifecycle():
    job_id = "job_unit_test"
    filename = "sample_media.mp4"

    # Write a test file
    file_path = storage_manager.get_job_file_path(job_id, filename)
    with open(file_path, "wb") as f:
        f.write(b"SAMPLE_VIDEO_DATA")

    assert storage_manager.file_exists(job_id, filename) is True
    info = storage_manager.get_file_info(job_id, filename)
    assert info is not None
    assert info["size"] == len(b"SAMPLE_VIDEO_DATA")

    # Delete job
    assert storage_manager.delete_job(job_id) is True
    assert storage_manager.file_exists(job_id, filename) is False


@pytest.mark.asyncio
async def test_direct_media_resolution_with_mocked_http():
    adapter = orchestrator
    test_url = "https://cdn.example.com/videos/nature_clip.mp4"

    # Mock HEAD response from external media server
    mock_resp = Response(
        status_code=200,
        headers={
            "content-type": "video/mp4",
            "content-length": "1048576",  # 1 MB
        },
    )

    with patch("httpx.AsyncClient.head", new_callable=AsyncMock) as mock_head:
        mock_head.return_value = mock_resp
        with patch("app.adapters.direct_media.validate_url_security") as mock_sec:
            mock_sec.return_value = (True, None, "93.184.216.34")
            from app.adapters.direct_media import DirectMediaAdapter
            dm_adapter = DirectMediaAdapter()
            result = await dm_adapter.resolve_media(test_url)

            assert result.provider == ProviderType.DIRECT_MEDIA
            assert result.can_download is True
            assert result.media_type == MediaType.VIDEO
            assert len(result.formats) == 1
            assert result.formats[0].file_size_bytes == 1048576
            assert result.formats[0].extension == ".mp4"
