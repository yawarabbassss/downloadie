import asyncio
import re
from typing import Optional, Tuple
import yt_dlp

from app.adapters.base import BaseProviderAdapter
from app.core.config import settings
from app.models.schemas import (
    CapabilityStatus,
    DownloadJobResponse,
    JobStatus,
    MediaFormatOption,
    MediaResolutionResult,
    MediaType,
    ProviderCapabilityInfo,
    ProviderType,
)


class FacebookAdapter(BaseProviderAdapter):
    """
    Adapter for Facebook videos and Reels.
    Supports public video extraction and Meta Graph API.
    """

    FACEBOOK_REGEX = re.compile(
        r"^https?:\/\/(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.watch)\/(?:watch\/\?v=\d+|[^\/]+\/videos\/\d+|reel\/\d+|[a-zA-Z0-9_\-\.]+)",
        re.IGNORECASE,
    )

    @property
    def provider_id(self) -> ProviderType:
        return ProviderType.FACEBOOK

    @property
    def display_name(self) -> str:
        return "Facebook"

    def can_handle(self, url: str) -> bool:
        if not url:
            return False
        clean = url.strip().lower()
        if "facebook.com" in clean or "fb.watch" in clean:
            return True
        return False

    def validate_url(self, url: str) -> Tuple[bool, Optional[str]]:
        if not self.can_handle(url):
            return False, "Not a recognized Facebook video or reel URL."
        return True, None

    def get_capabilities(self) -> ProviderCapabilityInfo:
        return ProviderCapabilityInfo(
            provider_id=self.provider_id,
            name="Facebook",
            description="Public Facebook videos and authorized creator reels.",
            status=CapabilityStatus.ACTIVE,
            is_configured=True,
            supported_media_types=[MediaType.VIDEO],
            supports_download=True,
            supports_metadata=True,
            requires_credentials=False,
            credential_instructions=None,
            official_alternative_url="https://www.facebook.com",
            policy_notice="Private groups and secret accounts require explicit permissions. Downloadie strictly prohibits session harvesting.",
        )

    def _extract_sync(self, url: str) -> dict:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "extract_flat": False,
            "socket_timeout": 15,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            return ydl.extract_info(url, download=False)

    async def resolve_media(
        self,
        url: str,
        auth_context: Optional[dict] = None,
    ) -> MediaResolutionResult:
        is_valid, error = self.validate_url(url)
        if not is_valid:
            return MediaResolutionResult(
                url=url,
                provider=self.provider_id,
                provider_name=self.display_name,
                status=CapabilityStatus.UNSUPPORTED,
                media_type=MediaType.UNKNOWN,
                can_download=False,
                notice_message=error,
            )

        try:
            info = await asyncio.to_thread(self._extract_sync, url)
        except Exception as exc:
            return MediaResolutionResult(
                url=url,
                provider=self.provider_id,
                provider_name=self.display_name,
                status=CapabilityStatus.REQUIRES_API_KEY,
                title="Facebook Video",
                media_type=MediaType.VIDEO,
                can_download=False,
                notice_message="This Facebook video appears to be private, restricted to a closed group, or requires a login.",
                official_alternative_url="https://www.facebook.com",
            )

        title = info.get("title") or "Facebook Video"
        thumbnail = info.get("thumbnail")
        duration = info.get("duration")

        formats = [
            MediaFormatOption(
                format_id="best_video",
                label="Best Quality MP4 Video",
                mime_type="video/mp4",
                extension=".mp4",
                quality="High Quality",
                file_size_bytes=info.get("filesize") or info.get("filesize_approx"),
                is_direct_stream=True,
            ),
            MediaFormatOption(
                format_id="audio_only",
                label="Audio Track Only",
                mime_type="audio/mp4",
                extension=".m4a",
                quality="Audio",
                is_direct_stream=True,
            ),
        ]

        return MediaResolutionResult(
            url=url,
            provider=self.provider_id,
            provider_name=self.display_name,
            status=CapabilityStatus.ACTIVE,
            title=title,
            caption=info.get("description"),
            author=info.get("uploader"),
            thumbnail_url=thumbnail,
            duration_seconds=duration,
            media_type=MediaType.VIDEO,
            formats=formats,
            carousel_items=[],
            can_download=True,
            notice_message="Facebook video verified and ready for download.",
            official_alternative_url="https://www.facebook.com",
        )

    async def create_download(
        self,
        url: str,
        format_id: Optional[str] = "best_video",
        item_index: Optional[int] = None,
        job_id: Optional[str] = None,
    ) -> DownloadJobResponse:
        from app.services.orchestrator import orchestrator
        return await orchestrator.create_download_job(
            url=url,
            provider=self.provider_id,
            format_id=format_id or "best_video",
            item_index=item_index,
            job_id=job_id,
        )

    async def get_job_status(self, job_id: str) -> DownloadJobResponse:
        from app.services.orchestrator import orchestrator
        return await orchestrator.get_job_status(job_id)
