import asyncio
import datetime
import hashlib
import os
import time
import uuid
from typing import Dict, Optional
from urllib.parse import urlparse

import httpx
import yt_dlp
from app.core.config import settings
from app.core.security import (
    ALLOWED_MIME_TYPES,
    EXT_TO_MIME,
    generate_download_token,
    get_extension_for_mime,
    is_allowed_mime_type,
    sanitize_filename,
)
from app.core.ssrf import validate_url_security
from app.models.schemas import (
    CapabilityStatus,
    DownloadJobResponse,
    JobStatus,
    ProviderType,
)
from app.services.storage import storage_manager


class DownloadOrchestrator:
    """Orchestrates authorized download requests, job status, streaming, and cleanup."""

    def __init__(self):
        # In-memory job state store: job_id -> dict
        self._jobs: Dict[str, dict] = {}
        self._lock = asyncio.Lock()

    async def get_job_status(self, job_id: str) -> DownloadJobResponse:
        job = self._jobs.get(job_id)
        if not job:
            return DownloadJobResponse(
                job_id=job_id,
                status=JobStatus.FAILED,
                provider=ProviderType.UNKNOWN,
                created_at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                error_code="JOB_NOT_FOUND",
                error_message=f"No download job found with ID '{job_id}'.",
            )

        # Check if job expired
        expires_at = job.get("expires_at")
        if expires_at and time.time() > expires_at:
            job["status"] = JobStatus.EXPIRED
            job["error_message"] = "This download job has expired."

        return DownloadJobResponse(
            job_id=job["id"],
            status=job["status"],
            provider=job["provider"],
            progress_percent=job.get("progress", 0),
            download_url=job.get("download_url"),
            stream_url=job.get("stream_url"),
            file_name=job.get("file_name"),
            file_size_bytes=job.get("file_size_bytes"),
            mime_type=job.get("mime_type"),
            created_at=job.get("created_at", datetime.datetime.now(datetime.timezone.utc).isoformat()),
            expires_at=datetime.datetime.fromtimestamp(expires_at, tz=datetime.timezone.utc).isoformat() if expires_at else None,
            error_code=job.get("error_code"),
            error_message=job.get("error_message"),
        )

    async def create_download_job(
        self,
        url: str,
        provider: ProviderType,
        format_id: str = "original",
        item_index: Optional[int] = None,
        job_id: Optional[str] = None,
    ) -> DownloadJobResponse:
        job_id = job_id or f"job_{uuid.uuid4().hex[:16]}"
        now = time.time()
        expires_at = int(now + (settings.job_expiration_minutes * 60))

        # Initial job state
        job_record = {
            "id": job_id,
            "provider": provider,
            "source_url": url,
            "format_id": format_id,
            "item_index": item_index,
            "status": JobStatus.PENDING,
            "progress": 0,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "expires_at": expires_at,
            "file_name": None,
            "file_size_bytes": None,
            "mime_type": None,
            "error_code": None,
            "error_message": None,
            "download_url": None,
            "stream_url": None,
        }

        async with self._lock:
            self._jobs[job_id] = job_record

        # Route download execution
        if provider == ProviderType.DIRECT_MEDIA:
            asyncio.create_task(self._process_direct_download(job_id, url))
        elif provider in (ProviderType.INSTAGRAM, ProviderType.YOUTUBE, ProviderType.TIKTOK, ProviderType.FACEBOOK):
            asyncio.create_task(self._process_ytdlp_download(job_id, url, format_id, item_index))
        else:
            job_record["status"] = JobStatus.FAILED
            job_record["error_code"] = "PROVIDER_UNSUPPORTED_OPERATION"
            job_record["error_message"] = f"Direct background downloading is not permitted for {provider.value}."

        return await self.get_job_status(job_id)

    async def _process_ytdlp_download(
        self,
        job_id: str,
        url: str,
        format_id: str,
        item_index: Optional[int] = None,
    ) -> None:
        """Download media using yt-dlp in a thread with progress tracking."""
        job = self._jobs.get(job_id)
        if not job:
            return

        job["status"] = JobStatus.PROCESSING
        job["progress"] = 10

        target_dir = storage_manager.get_job_directory(job_id)

        def progress_hook(d):
            if d.get("status") == "downloading":
                total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
                downloaded = d.get("downloaded_bytes", 0)
                if total > 0:
                    percent = min(98, max(10, int((downloaded / total) * 95)))
                    job["progress"] = percent

        def run_ytdlp():
            # Format selection: audio or single best pre-merged container (works without ffmpeg)
            if format_id == "audio_only":
                ydl_format = "bestaudio/best"
            else:
                ydl_format = "best[ext=mp4]/best"

            outtmpl = os.path.join(target_dir, "%(id)s.%(ext)s")
            ydl_opts = {
                "outtmpl": outtmpl,
                "quiet": True,
                "no_warnings": True,
                "format": ydl_format,
                "progress_hooks": [progress_hook],
                "max_filesize": settings.max_download_size_bytes,
                "socket_timeout": 30,
            }

            if item_index is not None:
                ydl_opts["playlist_items"] = str(item_index + 1)

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])

        try:
            await asyncio.to_thread(run_ytdlp)

            # Locate downloaded file
            files = [f for f in os.listdir(target_dir) if not f.endswith(".part") and not f.endswith(".temp")]
            if not files:
                raise FileNotFoundError("No output media file was created by downloader.")

            target_file = files[0]
            clean_name = sanitize_filename(target_file)
            final_path = os.path.join(target_dir, clean_name)
            if target_file != clean_name:
                os.rename(os.path.join(target_dir, target_file), final_path)

            file_stat = os.stat(final_path)
            ext = os.path.splitext(clean_name)[1].lower()
            mime_type = EXT_TO_MIME.get(ext, "application/octet-stream")

            token = generate_download_token(job_id, settings.secret_key, job["expires_at"])
            download_endpoint = f"{settings.api_prefix}/downloads/{job_id}/stream?token={token}"

            job["status"] = JobStatus.READY
            job["progress"] = 100
            job["file_name"] = clean_name
            job["file_size_bytes"] = file_stat.st_size
            job["mime_type"] = mime_type
            job["download_url"] = download_endpoint
            job["stream_url"] = download_endpoint

        except Exception as exc:
            job["status"] = JobStatus.FAILED
            job["error_code"] = "DOWNLOAD_EXTRACTION_ERROR"
            job["error_message"] = f"Failed to download media: {str(exc)[:150]}"

    async def _process_direct_download(self, job_id: str, url: str) -> None:
        """Asynchronously stream remote media into isolated ephemeral storage."""
        job = self._jobs.get(job_id)
        if not job:
            return

        job["status"] = JobStatus.PROCESSING
        job["progress"] = 5

        # 1. SSRF check
        is_safe, error, _ = validate_url_security(
            url,
            allow_private_networks=settings.allow_private_networks_for_tests,
        )
        if not is_safe:
            job["status"] = JobStatus.FAILED
            job["error_code"] = "SSRF_SECURITY_BLOCK"
            job["error_message"] = f"Security error: {error}"
            return

        headers = {
            "User-Agent": "Downloadie/1.0 (+https://downloadie.app/bot)",
            "Accept": "*/*",
        }

        temp_file_path = None
        try:
            curr_url = url
            async with httpx.AsyncClient(
                timeout=settings.request_timeout_seconds,
                follow_redirects=False,
                verify=True,
            ) as client:
                for hop in range(5):
                    is_hop_safe, hop_error, _ = validate_url_security(
                        curr_url,
                        allow_private_networks=settings.allow_private_networks_for_tests,
                    )
                    if not is_hop_safe:
                        job["status"] = JobStatus.FAILED
                        job["error_code"] = "SSRF_REDIRECT_BLOCK"
                        job["error_message"] = f"Redirect blocked: {hop_error}"
                        return

                    async with client.stream("GET", curr_url, headers=headers) as response:
                        if response.status_code in (301, 302, 303, 307, 308):
                            location = response.headers.get("location")
                            if not location:
                                raise ValueError("Redirect response missing location header.")
                            curr_url = str(httpx.URL(curr_url).join(location))
                            continue

                        if response.status_code not in (200, 206):
                            job["status"] = JobStatus.FAILED
                            job["error_code"] = "HTTP_ERROR"
                            job["error_message"] = f"Media server responded with status {response.status_code}."
                            return

                        content_type = response.headers.get("content-type", "").split(";")[0].strip().lower()
                        parsed = urlparse(curr_url)
                        path_ext = os.path.splitext(parsed.path.lower())[1]
                        if (not content_type or content_type == "application/octet-stream") and path_ext in EXT_TO_MIME:
                            content_type = EXT_TO_MIME[path_ext]

                        if not is_allowed_mime_type(content_type):
                            job["status"] = JobStatus.FAILED
                            job["error_code"] = "DISALLOWED_MIME_TYPE"
                            job["error_message"] = f"Disallowed MIME type: {content_type or 'unknown'}."
                            return

                        cl_header = response.headers.get("content-length")
                        expected_length = int(cl_header) if cl_header and cl_header.isdigit() else None
                        if expected_length and expected_length > settings.max_download_size_bytes:
                            job["status"] = JobStatus.FAILED
                            job["error_code"] = "FILE_TOO_LARGE"
                            job["error_message"] = "File size exceeds allowed limits."
                            return

                        # Safe filename
                        ext = get_extension_for_mime(content_type, fallback=path_ext or ".bin")
                        raw_filename = os.path.basename(parsed.path) or f"download{ext}"
                        clean_filename = sanitize_filename(raw_filename, fallback_ext=ext)

                        target_file_path = storage_manager.get_job_file_path(job_id, clean_filename)
                        temp_file_path = f"{target_file_path}.downloading"

                        downloaded_bytes = 0
                        with open(temp_file_path, "wb") as f:
                            async for chunk in response.aiter_bytes(chunk_size=65536):
                                if not chunk:
                                    continue
                                downloaded_bytes += len(chunk)
                                if downloaded_bytes > settings.max_download_size_bytes:
                                    raise ValueError("Download exceeded maximum allowed size ceiling.")
                                f.write(chunk)
                                if expected_length:
                                    percent = min(98, 10 + int((downloaded_bytes / expected_length) * 85))
                                    job["progress"] = percent

                        if os.path.exists(target_file_path):
                            os.remove(target_file_path)
                        os.rename(temp_file_path, target_file_path)

                        token = generate_download_token(job_id, settings.secret_key, job["expires_at"])
                        download_endpoint = f"{settings.api_prefix}/downloads/{job_id}/stream?token={token}"

                        job["status"] = JobStatus.READY
                        job["progress"] = 100
                        job["file_name"] = clean_filename
                        job["file_size_bytes"] = downloaded_bytes
                        job["mime_type"] = content_type
                        job["download_url"] = download_endpoint
                        job["stream_url"] = download_endpoint
                        return

        except Exception as exc:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except Exception:
                    pass
            job["status"] = JobStatus.FAILED
            job["error_code"] = "DOWNLOAD_PROCESSING_ERROR"
            job["error_message"] = f"Failed to download media: {str(exc)}"


orchestrator = DownloadOrchestrator()
