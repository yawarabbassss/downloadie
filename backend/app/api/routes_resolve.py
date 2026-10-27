from fastapi import APIRouter, HTTPException, Request, status
from app.adapters.registry import registry
from app.core.config import settings
from app.core.security import TokenBucketRateLimiter
from app.models.schemas import (
    CapabilityStatus,
    MediaResolutionResult,
    MediaType,
    ProviderType,
    ResolveUrlRequest,
)

router = APIRouter(tags=["Media Resolution"])

rate_limiter = TokenBucketRateLimiter(
    rate_per_minute=settings.rate_limit_per_minute,
    burst_capacity=settings.rate_limit_burst,
)


@router.post("/resolve", response_model=MediaResolutionResult)
async def resolve_media_url(req: ResolveUrlRequest, request: Request):
    """
    Resolve media metadata and download options for a submitted URL.
    Validates security, identifies provider, and reports capabilities honestly.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, retry_after = rate_limiter.is_allowed(client_ip)
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Please retry in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    url_str = req.url.strip()
    adapter = registry.find_adapter_for_url(url_str)
    if not adapter:
        return MediaResolutionResult(
            url=url_str,
            provider=ProviderType.UNKNOWN,
            provider_name="Unsupported Provider",
            status=CapabilityStatus.UNSUPPORTED,
            media_type=MediaType.UNKNOWN,
            can_download=False,
            notice_message="This domain or link format is not currently supported by Downloadie. Supported providers include Direct Media files, Instagram, YouTube, TikTok, and Facebook.",
        )

    return await adapter.resolve_media(url_str)
