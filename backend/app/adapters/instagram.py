import asyncio
import re
from typing import Optional, Tuple
import yt_dlp

from app.adapters.base import BaseProviderAdapter
from app.core.config import settings
from app.models.schemas import (
    CapabilityStatus,
    CarouselItem,
    DownloadJobResponse,
    JobStatus,
    MediaFormatOption,
    MediaResolutionResult,
    MediaType,
    ProviderCapabilityInfo,
    ProviderType,
)


class InstagramAdapter(BaseProviderAdapter):
    """
    Adapter for Instagram (Reels, Posts, Carousels, Stories).
    Extracts public posts and reels, and supports Meta Graph API when configured.
    """

    INSTAGRAM_REGEX = re.compile(
        r"^https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv|stories|share)\/([a-zA-Z0-9_\-\.]+)\/?",
        re.IGNORECASE,
    )

    @property
    def provider_id(self) -> ProviderType:
        return ProviderType.INSTAGRAM

    @property
    def display_name(self) -> str:
        return "Instagram"

    def can_handle(self, url: str) -> bool:
        if not url:
            return False
        return bool(self.INSTAGRAM_REGEX.match(url.strip()))

    def validate_url(self, url: str) -> Tuple[bool, Optional[str]]:
        if not self.can_handle(url):
            return False, "Not a valid Instagram URL. Supported formats: /p/, /reel/, /tv/, or /stories/."
        return True, None

    def get_capabilities(self) -> ProviderCapabilityInfo:
        return ProviderCapabilityInfo(
            provider_id=self.provider_id,
            name="Instagram",
            description="Supports Reels, feed photos, carousels, and public media.",
            status=CapabilityStatus.ACTIVE,
            is_configured=True,
            supported_media_types=[MediaType.VIDEO, MediaType.IMAGE, MediaType.CAROUSEL],
            supports_download=True,
            supports_metadata=True,
            requires_credentials=False,
            credential_instructions="Works out-of-the-box for public posts. Optional INSTAGRAM_ACCESS_TOKEN for private creator APIs.",
            official_alternative_url="https://www.instagram.com",
            policy_notice="Only download content you own or are authorized to save. Private accounts cannot be accessed.",
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

        match = self.INSTAGRAM_REGEX.match(url.strip())
        shortcode = match.group(1) if match else "media"
        is_story = "/stories/" in url.lower()
        is_reel = "/reel/" in url.lower()

        # Attempt extraction via yt-dlp in a thread
        try:
            info = await asyncio.to_thread(self._extract_sync, url)
        except Exception as exc:
            err_str = str(exc)
            notice = (
                "This Instagram media is private, expired, or cannot be accessed without an authorized login. "
                "Downloadie respects user privacy and does not scrape private profiles. "
                "Configure INSTAGRAM_ACCESS_TOKEN via Meta Graph API if required."
            )
            return MediaResolutionResult(
                url=url,
                provider=self.provider_id,
                provider_name=self.display_name,
                status=CapabilityStatus.REQUIRES_API_KEY,
                title=f"Instagram {'Story' if is_story else ('Reel' if is_reel else 'Post')} ({shortcode})",
                media_type=MediaType.VIDEO if is_reel else MediaType.UNKNOWN,
                can_download=False,
                notice_message=notice,
                official_alternative_url=f"https://www.instagram.com/p/{shortcode}/",
            )

        # Extraction succeeded!
        title = info.get("title") or f"Instagram {'Reel' if is_reel else 'Post'} by {info.get('uploader', shortcode)}"
        thumbnail = info.get("thumbnail")
        duration = info.get("duration")

        # Determine media type and formats
        entries = info.get("entries")
        carousel_items = []

        if entries:
            media_type = MediaType.CAROUSEL
            for idx, entry in enumerate(entries):
                entry_url = entry.get("url") or (entry.get("formats")[-1].get("url") if entry.get("formats") else None)
                entry_thumb = entry.get("thumbnail") or thumbnail
                entry_ext = entry.get("ext", "mp4")
                is_vid = entry.get("vcodec") != "none" if entry.get("vcodec") else (entry_ext == "mp4")
                item_formats = [
                    MediaFormatOption(
                        format_id=f"item_{idx}_orig",
                        label=f"Item {idx + 1} ({entry_ext.upper()})",
                        mime_type="video/mp4" if is_vid else "image/jpeg",
                        extension=f".{entry_ext}",
                        quality="High Quality",
                        file_size_bytes=entry.get("filesize"),
                        is_direct_stream=True,
                    )
                ]
                carousel_items.append(
                    CarouselItem(
                        item_index=idx,
                        media_type=MediaType.VIDEO if is_vid else MediaType.IMAGE,
                        url=entry_url or url,
                        thumbnail_url=entry_thumb,
                        title=f"Carousel Item {idx + 1}",
                        formats=item_formats,
                    )
                )
        elif info.get("vcodec") != "none" or is_reel or info.get("ext") in ("mp4", "webm"):
            media_type = MediaType.VIDEO
        else:
            media_type = MediaType.IMAGE

        formats = []
        if media_type == MediaType.VIDEO:
            formats.append(
                MediaFormatOption(
                    format_id="best_video",
                    label="HD MP4 Video",
                    mime_type="video/mp4",
                    extension=".mp4",
                    quality="Original HD",
                    file_size_bytes=info.get("filesize") or info.get("filesize_approx"),
                    is_direct_stream=True,
                )
            )
            formats.append(
                MediaFormatOption(
                    format_id="audio_only",
                    label="Audio Track (M4A/MP3)",
                    mime_type="audio/mp4",
                    extension=".m4a",
                    quality="Audio",
                    is_direct_stream=True,
                )
            )
        else:
            formats.append(
                MediaFormatOption(
                    format_id="best_image",
                    label="High Resolution Image (JPG)",
                    mime_type="image/jpeg",
                    extension=".jpg",
                    quality="Original",
                    file_size_bytes=info.get("filesize") or info.get("filesize_approx"),
                    is_direct_stream=True,
                )
            )

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
            media_type=media_type,
            formats=formats,
            carousel_items=carousel_items,
            can_download=True,
            notice_message="Instagram media successfully resolved and ready to download.",
            official_alternative_url=f"https://www.instagram.com/p/{shortcode}/",
        )

    async def create_download(
        self,
        url: str,
        format_id: Optional[str] = "original",
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
