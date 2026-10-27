import pytest
from app.adapters.registry import registry
from app.models.schemas import CapabilityStatus, MediaType, ProviderType


def test_registry_contains_all_core_adapters():
    capabilities = registry.list_all_capabilities()
    provider_ids = [cap.provider_id for cap in capabilities]

    assert ProviderType.INSTAGRAM in provider_ids
    assert ProviderType.YOUTUBE in provider_ids
    assert ProviderType.TIKTOK in provider_ids
    assert ProviderType.FACEBOOK in provider_ids
    assert ProviderType.DIRECT_MEDIA in provider_ids


def test_url_detection_routing():
    # Instagram
    ig_adapter = registry.find_adapter_for_url("https://www.instagram.com/reel/C12345ABC/")
    assert ig_adapter is not None
    assert ig_adapter.provider_id == ProviderType.INSTAGRAM

    # YouTube
    yt_adapter = registry.find_adapter_for_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert yt_adapter is not None
    assert yt_adapter.provider_id == ProviderType.YOUTUBE

    yt_short_adapter = registry.find_adapter_for_url("https://youtube.com/shorts/abcd1234efg")
    assert yt_short_adapter is not None
    assert yt_short_adapter.provider_id == ProviderType.YOUTUBE

    # TikTok
    tt_adapter = registry.find_adapter_for_url("https://www.tiktok.com/@creator/video/7123456789012345678")
    assert tt_adapter is not None
    assert tt_adapter.provider_id == ProviderType.TIKTOK

    # Facebook
    fb_adapter = registry.find_adapter_for_url("https://www.facebook.com/watch/?v=123456789")
    assert fb_adapter is not None
    assert fb_adapter.provider_id == ProviderType.FACEBOOK

    # Direct Media
    direct_adapter = registry.find_adapter_for_url("https://cdn.example.com/assets/promotional_video.mp4")
    assert direct_adapter is not None
    assert direct_adapter.provider_id == ProviderType.DIRECT_MEDIA


@pytest.mark.asyncio
async def test_instagram_adapter_unconfigured_response():
    adapter = registry.get_adapter(ProviderType.INSTAGRAM)
    res = await adapter.resolve_media("https://www.instagram.com/p/CXYZ9876/")
    assert res.provider == ProviderType.INSTAGRAM
    assert res.status in (CapabilityStatus.REQUIRES_API_KEY, CapabilityStatus.ACTIVE)
    if not res.can_download:
        assert "Meta Graph API" in res.notice_message


@pytest.mark.asyncio
async def test_youtube_adapter_resolution():
    adapter = registry.get_adapter(ProviderType.YOUTUBE)
    res = await adapter.resolve_media("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    assert res.provider == ProviderType.YOUTUBE
    assert res.status == CapabilityStatus.ACTIVE
    assert res.can_download is True
    assert len(res.formats) >= 1


@pytest.mark.asyncio
async def test_tiktok_adapter_developer_credentials_notice():
    adapter = registry.get_adapter(ProviderType.TIKTOK)
    res = await adapter.resolve_media("https://www.tiktok.com/@user/video/7000000000000000000")
    assert res.provider == ProviderType.TIKTOK
    if not res.can_download:
        assert res.status == CapabilityStatus.REQUIRES_API_KEY
        assert "TikTok for Developers" in res.notice_message
