import datetime
import os
import uuid
from typing import Optional, Tuple
from urllib.parse import urlparse
import httpx

from app.adapters.base import BaseProviderAdapter
from app.core.config import settings
from app.core.security import (
    ALLOWED_MIME_TYPES,
    EXT_TO_MIME,
    get_extension_for_mime,
    is_allowed_mime_type,
    sanitize_filename,
)
from app.core.ssrf import validate_url_security
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


KNOWN_MEDIA_EXTENSIONS = {
    ".mp4", ".webm", ".mov", ".mkv", ".m4v", ".ogv",
    ".mp3", ".wav", ".m4a", ".ogg", ".flac", ".weba",
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg",
}


class DirectMediaAdapter(BaseProviderAdapter):
    """
    Adapter for direct media URLs (MP4, WEBM, MP3, WAV, JPG, PNG, WEBP, etc.).
    Fully functional out-of-the-box with SSRF security and streaming download support.
    """

    @property
    def provider_id(self) -> ProviderType:
        return ProviderType.DIRECT_MEDIA

    @property
    def display_name(self) -> str:
        return "Direct Media Link"

    def can_handle(self, url: str) -> bool:
        if not url:
            return False
        try:
            parsed = urlparse(url.strip())
            path_lower = parsed.path.lower()
            ext = os.path.splitext(path_lower)[1]
            if ext in KNOWN_MEDIA_EXTENSIONS:
                return True
            # Check query parameters for media extensions (e.g. image.php?file=pic.png)
            query_lower = parsed.query.lower()
            if any(ext in query_lower for ext in KNOWN_MEDIA_EXTENSIONS):
                return True
            # If not a known social media domain, allow testing as direct link
            hostname = (parsed.hostname or "").lower()
            social_domains = ["instagram.com", "instagr.am", "youtube.com", "youtu.be", "tiktok.com", "facebook.com", "fb.watch"]
            if not any(soc in hostname for soc in social_domains) and parsed.scheme in ("http", "https"):
                # Could be a direct media stream or user CDN link
                return True
        except Exception:
            return False
        return False

    def validate_url(self, url: str) -> Tuple[bool, Optional[str]]:
        is_safe, error, _ = validate_url_security(
            url,
            allow_private_networks=settings.allow_private_networks_for_tests,
        )
        if not is_safe:
            return False, error
        return True, None

    def get_capabilities(self) -> ProviderCapabilityInfo:
        return ProviderCapabilityInfo(
            provider_id=self.provider_id,
            name="Direct Media & Storage",
            description="Direct HTTP/HTTPS video, audio, and image links with SSRF defense and instant streaming.",
            status=CapabilityStatus.ACTIVE,
            is_configured=True,
            supported_media_types=[MediaType.VIDEO, MediaType.AUDIO, MediaType.IMAGE],
            supports_download=True,
            supports_metadata=True,
            requires_credentials=False,
            credential_instructions=None,
            official_alternative_url=None,
            policy_notice="Only download media you own or have explicit legal permission to save.",
        )

    async def resolve_media(
        self,
        url: str,
        auth_context: Optional[dict] = None,
    ) -> MediaResolutionResult:
        # Validate SSRF
        is_safe, error = self.validate_url(url)
        if not is_safe:
            return MediaResolutionResult(
                url=url,
                provider=self.provider_id,
                provider_name=self.display_name,
                status=CapabilityStatus.UNSUPPORTED,
                media_type=MediaType.UNKNOWN,
                can_download=False,
                notice_message=f"Security check failed: {error}",
            )

        # Probe external media via HEAD/GET with strict timeouts and redirect re-validation
        headers = {
            "User-Agent": "Downloadie/1.0 (+https://downloadie.app/bot)",
            "Accept": "*/*",
        }

        content_type = ""
        content_length = None
        effective_url = url

        async with httpx.AsyncClient(
            timeout=settings.request_timeout_seconds,
            follow_redirects=False,
            verify=True,
        ) as client:
            curr_url = url
            # Manually follow redirects up to 5 times to validate SSRF on each hop
            for _ in range(5):
                is_hop_safe, hop_error, _ = validate_url_security(
                    curr_url,
                    allow_private_networks=settings.allow_private_networks_for_tests,
                )
                if not is_hop_safe:
                    return MediaResolutionResult(
                        url=url,
                        provider=self.provider_id,
                        provider_name=self.display_name,
                        status=CapabilityStatus.UNSUPPORTED,
                        media_type=MediaType.UNKNOWN,
                        can_download=False,
                        notice_message=f"Redirect security check failed: {hop_error}",
                    )

                try:
                    res = await client.head(curr_url, headers=headers)
                except Exception:
                    # Fallback to GET with small byte range if server rejects HEAD
                    try:
                        res = await client.get(curr_url, headers={**headers, "Range": "bytes=0-1024"})
                    except Exception as exc:
                        return MediaResolutionResult(
                            url=url,
                            provider=self.provider_id,
                            provider_name=self.display_name,
                            status=CapabilityStatus.UNSUPPORTED,
                            media_type=MediaType.UNKNOWN,
                            can_download=False,
                            notice_message=f"Failed to connect to media server: {exc}",
                        )

                if res.status_code in (301, 302, 303, 307, 308):
                    redirect_location = res.headers.get("location")
                    if not redirect_location:
                        break
                    curr_url = str(httpx.URL(curr_url).join(redirect_location))
                    effective_url = curr_url
                    continue
                else:
                    content_type = res.headers.get("content-type", "").split(";")[0].strip().lower()
                    cl = res.headers.get("content-length")
                    if cl and cl.isdigit():
                        content_length = int(cl)
                    break

        # Fallback if Content-Type is generic stream (e.g. application/octet-stream)
        parsed = urlparse(effective_url)
        path_ext = os.path.splitext(parsed.path.lower())[1]
        if (not content_type or content_type == "application/octet-stream") and path_ext in EXT_TO_MIME:
            content_type = EXT_TO_MIME[path_ext]

        if not is_allowed_mime_type(content_type):
            return MediaResolutionResult(
                url=url,
                provider=self.provider_id,
                provider_name=self.display_name,
                status=CapabilityStatus.UNSUPPORTED,
                media_type=MediaType.UNKNOWN,
                can_download=False,
                notice_message=f"Content-Type '{content_type or 'unknown'}' is not a recognized media format. Supported formats include MP4, WEBM, MOV, MP3, WAV, JPG, PNG, WEBP, GIF.",
            )

        # Enforce size limits
        if content_length and content_length > settings.max_download_size_bytes:
            mb = content_length / (1024 * 1024)
            limit_mb = settings.max_download_size_bytes / (1024 * 1024)
            return MediaResolutionResult(
                url=url,
                provider=self.provider_id,
                provider_name=self.display_name,
                status=CapabilityStatus.UNSUPPORTED,
                media_type=MediaType.UNKNOWN,
                can_download=False,
                notice_message=f"File size ({mb:.1f} MB) exceeds maximum allowed limit of {limit_mb:.0f} MB.",
            )

        # Classify media type
        media_type = MediaType.UNKNOWN
        if content_type.startswith("video/"):
            media_type = MediaType.VIDEO
        elif content_type.startswith("audio/"):
            media_type = MediaType.AUDIO
        elif content_type.startswith("image/"):
            media_type = MediaType.IMAGE

        filename = os.path.basename(parsed.path) or "download"
        ext = get_extension_for_mime(content_type, fallback=path_ext or ".bin")
        clean_name = sanitize_filename(filename, fallback_ext=ext)

        format_option = MediaFormatOption(
            format_id="original",
            label=f"Original Quality ({clean_name})",
            mime_type=content_type,
            extension=ext,
            quality="Original",
            file_size_bytes=content_length,
            is_direct_stream=True,
        )

        return MediaResolutionResult(
            url=url,
            provider=self.provider_id,
            provider_name=self.display_name,
            status=CapabilityStatus.ACTIVE,
            title=clean_name,
            thumbnail_url=url if media_type == MediaType.IMAGE else None,
            media_type=media_type,
            formats=[format_option],
            carousel_items=[],
            can_download=True,
            notice_message="Direct media link verified and ready for download.",
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
            format_id=format_id or "original",
            job_id=job_id,
        )

    async def get_job_status(self, job_id: str) -> DownloadJobResponse:
        from app.services.orchestrator import orchestrator
        return await orchestrator.get_job_status(job_id)
