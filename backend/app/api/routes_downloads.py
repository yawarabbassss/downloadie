import os
from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import FileResponse, StreamingResponse
from app.adapters.registry import registry
from app.core.config import settings
from app.core.security import (
    TokenBucketRateLimiter,
    verify_download_token,
)
from app.models.schemas import (
    CreateDownloadRequest,
    DownloadJobResponse,
    JobStatus,
    ProviderType,
)
from app.services.orchestrator import orchestrator
from app.services.storage import storage_manager

router = APIRouter(tags=["Downloads"])

download_rate_limiter = TokenBucketRateLimiter(
    rate_per_minute=settings.rate_limit_per_minute,
    burst_capacity=settings.rate_limit_burst,
)


@router.post("/downloads", response_model=DownloadJobResponse)
async def create_download_job(req: CreateDownloadRequest, request: Request):
    """
    Initiate an authorized media download job.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, retry_after = download_rate_limiter.is_allowed(client_ip)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Please wait {retry_after} seconds before requesting another download.",
            headers={"Retry-After": str(retry_after)},
        )

    url_str = req.url.strip()
    adapter = registry.find_adapter_for_url(url_str)
    if not adapter:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start download: URL provider is not recognized or supported.",
        )

    return await adapter.create_download(
        url=url_str,
        format_id=req.format_id or "original",
        item_index=req.item_index,
    )


@router.get("/downloads/{job_id}", response_model=DownloadJobResponse)
async def get_download_job(job_id: str):
    """
    Poll status of an existing download job.
    """
    return await orchestrator.get_job_status(job_id)


@router.get("/downloads/{job_id}/stream")
async def stream_download_file(
    job_id: str,
    token: str = Query(..., description="Cryptographic ephemeral access token"),
):
    """
    Stream or download the processed media file using verified token.
    Enforces expiration, isolated paths, and correct Content-Disposition.
    """
    # 1. Verify token
    if not verify_download_token(job_id, token, settings.secret_key):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or expired download token.",
        )

    # 2. Get job
    job = await orchestrator.get_job_status(job_id)
    if job.status != JobStatus.READY or not job.file_name:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File is not ready or has expired.",
        )

    file_path = storage_manager.get_job_file_path(job_id, job.file_name)
    if not os.path.isfile(file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Downloaded media file was purged or cannot be located.",
        )

    return FileResponse(
        path=file_path,
        media_type=job.mime_type or "application/octet-stream",
        filename=job.file_name,
        content_disposition_type="attachment",
    )
