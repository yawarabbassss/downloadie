import asyncio
import re
from typing import Optional, Tuple
from urllib.parse import parse_qs, urlparse
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


class YouTubeAdapter(BaseProviderAdapter):
    """
    Adapter for YouTube videos and Shorts.
    Extracts public video metadata and authorized download streams.
    """

    YOUTUBE_REGEX = re.compile(
        r"^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_\-]{11})",
        re.IGNORECASE,
    )

    @property
    def provider_id(self) -> ProviderType:
        return ProviderType.YOUTUBE

    @property
    def display_name(self) -> str:
        return "YouTube"

    def can_handle(self, url: str) -> bool:
        if not url:
            return False
        return bool(self.YOUTUBE_REGEX.match(url.strip()))

    def validate_url(self, url: str) -> Tuple[bool, Optional[str]]:
        if not self.can_handle(url):
            return False, "Not a valid YouTube video or Shorts URL."
        return True, None

    def get_capabilities(self) -> ProviderCapabilityInfo:
        return ProviderCapabilityInfo(
            provider_id=self.provider_id,
            name="YouTube",
            description="Video downloads, Shorts, and audio extraction.",
            status=CapabilityStatus.ACTIVE,
            is_configured=True,
            supported_media_types=[MediaType.VIDEO, MediaType.AUDIO],
            supports_download=True,
            supports_metadata=True,
            requires_credentials=False,
            credential_instructions=None,
            official_alternative_url="https://studio.youtube.com",
            policy_notice="Only download content you own or have permission to save. Creators can manage masters in YouTube Studio.",
        )

    def extract_video_id(self, url: str) -> Optional[str]:
        match = self.YOUTUBE_REGEX.match(url.strip())
        if match:
            return match.group(1)
        parsed = urlparse(url)
        qs = parse_qs(parsed.query)
        return qs.get("v", [None])[0]

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

        video_id = self.extract_video_id(url) or "video"
        is_shorts = "/shorts/" in url.lower()

        try:
            info = await asyncio.to_thread(self._extract_sync, url)
        except Exception as exc:
            return MediaResolutionResult(
                url=url,
                provider=self.provider_id,
                provider_name=self.display_name,
                status=CapabilityStatus.TERMS_RESTRICTED,
                title=f"YouTube {'Shorts' if is_shorts else 'Video'} ({video_id})",
                thumbnail_url=f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
                media_type=MediaType.VIDEO,
                can_download=False,
                notice_message=f"Could not retrieve YouTube video: {str(exc)[:150]}",
                official_alternative_url=f"https://www.youtube.com/watch?v={video_id}",
            )

        title = info.get("title") or f"YouTube {'Shorts' if is_shorts else 'Video'}"
        thumbnail = info.get("thumbnail") or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        duration = info.get("duration")

        formats = [
            MediaFormatOption(
                format_id="best_video",
                label="Best Quality MP4 Video (1080p/720p)",
                mime_type="video/mp4",
                extension=".mp4",
                quality="High Definition",
                file_size_bytes=info.get("filesize") or info.get("filesize_approx"),
                is_direct_stream=True,
            ),
            MediaFormatOption(
                format_id="720p",
                label="Standard 720p MP4 Video",
                mime_type="video/mp4",
                extension=".mp4",
                quality="720p",
                is_direct_stream=True,
            ),
            MediaFormatOption(
                format_id="audio_only",
                label="Audio Track Only (MP3/M4A)",
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
            notice_message="YouTube video verified and ready for download.",
            official_alternative_url=f"https://www.youtube.com/watch?v={video_id}",
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
