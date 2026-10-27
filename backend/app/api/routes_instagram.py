import uuid
from typing import Optional
from fastapi import APIRouter, Cookie, Header, HTTPException, Query, Request, Response, status

from app.core.config import settings
from app.core.security import TokenBucketRateLimiter
from app.models.schemas import (
    CarouselDownloadRequest,
    CarouselJobResponse,
    CarouselResolveResponse,
    InstagramAnalysisResponse,
    InstagramAnalyzeRequest,
    InstagramAuthStartResponse,
    InstagramConnectedAccountInfo,
    InstagramGrowthAnalytics,
)
from app.services.instagram_service import instagram_service

router = APIRouter(prefix="/instagram", tags=["Instagram Integration"])

rate_limiter = TokenBucketRateLimiter(rate_per_minute=40, burst_capacity=10)


def get_or_set_session_id(
    request: Request,
    response: Response,
    x_session_id: Optional[str] = Header(None),
    downloadie_session: Optional[str] = Cookie(None),
) -> str:
    """Extract or establish a consistent anonymous session ID for tracking connected accounts."""
    session_id = x_session_id or downloadie_session
    if not session_id:
        session_id = f"sess_{uuid.uuid4().hex[:16]}"
        response.set_cookie(
            key="downloadie_session",
            value=session_id,
            max_age=30 * 86400,
            httponly=True,
            samesite="lax",
        )
    return session_id


@router.post("/analyze", response_model=InstagramAnalysisResponse)
async def analyze_instagram_profile(
    req: InstagramAnalyzeRequest,
    request: Request,
    response: Response,
    x_session_id: Optional[str] = Header(None),
    downloadie_session: Optional[str] = Cookie(None),
):
    """
    Analyze an Instagram profile.
    Returns:
    - Profile overview
    - Transparent public or authorized performance metrics
    - Historical follower growth analytics calculated from database snapshots
    - Top-performing media items with sortable metrics
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, retry_after = rate_limiter.is_allowed(f"analyze_{client_ip}")
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Analysis rate limit reached. Please wait {retry_after} seconds.",
        )

    session_id = get_or_set_session_id(request, response, x_session_id, downloadie_session)
    try:
        return await instagram_service.analyze_profile(
            username_or_url=req.username_or_url,
            session_id=session_id,
            force_refresh=req.force_refresh,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing Instagram profile: {str(exc)}",
        )


@router.get("/profiles/{username}", response_model=InstagramAnalysisResponse)
async def get_instagram_profile(
    username: str,
    request: Request,
    response: Response,
    x_session_id: Optional[str] = Header(None),
    downloadie_session: Optional[str] = Cookie(None),
):
    """Retrieve current analysis and metrics for a specific username."""
    session_id = get_or_set_session_id(request, response, x_session_id, downloadie_session)
    try:
        return await instagram_service.analyze_profile(username_or_url=username, session_id=session_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/profiles/{username}/growth", response_model=InstagramGrowthAnalytics)
async def get_instagram_growth(
    username: str,
    days: int = Query(default=30, ge=7, le=90, description="Growth window (7, 30, or 90 days)"),
):
    """Retrieve historical follower growth analytics filtered by date range."""
    cleaned = instagram_service.clean_username(username)
    if not cleaned:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Instagram username.")
    return await instagram_service.get_growth_analytics(cleaned, current_followers=0, requested_days=days)


# ==========================================
# Meta Graph API Connected Accounts
# ==========================================

@router.get("/auth/start", response_model=InstagramAuthStartResponse)
async def start_instagram_auth(state: Optional[str] = None):
    """Generate official Meta OAuth authorization URL."""
    state_token = state or uuid.uuid4().hex[:16]
    return instagram_service.get_oauth_start_url(state=state_token)


@router.get("/auth/callback")
async def handle_instagram_auth_callback(
    code: str = Query(...),
    state: str = Query(...),
    request: Request = None,
    response: Response = None,
    x_session_id: Optional[str] = Header(None),
    downloadie_session: Optional[str] = Cookie(None),
):
    """Exchange OAuth code for long-lived access token and store securely."""
    session_id = get_or_set_session_id(request, response, x_session_id, downloadie_session)
    try:
        result = await instagram_service.handle_oauth_callback(code, state, session_id)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get("/connected", response_model=InstagramConnectedAccountInfo)
async def get_connected_account_status(
    request: Request,
    response: Response,
    x_session_id: Optional[str] = Header(None),
    downloadie_session: Optional[str] = Cookie(None),
):
    """Check if an Instagram account is connected in the active session."""
    session_id = get_or_set_session_id(request, response, x_session_id, downloadie_session)
    return await instagram_service.get_connection_status(session_id)


@router.post("/disconnect")
async def disconnect_instagram_account(
    request: Request,
    response: Response,
    x_session_id: Optional[str] = Header(None),
    downloadie_session: Optional[str] = Cookie(None),
):
    """Disconnect and revoke credentials for connected Instagram Professional account."""
    session_id = get_or_set_session_id(request, response, x_session_id, downloadie_session)
    success = await instagram_service.disconnect_account(session_id)
    return {"success": success, "message": "Instagram account disconnected successfully."}


# ==========================================
# One-Click Carousel Downloader
# ==========================================

@router.post("/carousels/resolve", response_model=CarouselResolveResponse)
async def resolve_instagram_carousel(req: CarouselDownloadRequest):
    """Resolve all slides in an Instagram carousel post in sequential order."""
    try:
        return await instagram_service.resolve_carousel(req.url)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to resolve carousel slides: {str(exc)}",
        )


@router.post("/carousels/download", response_model=CarouselJobResponse)
async def create_carousel_download_job(
    req: CarouselDownloadRequest,
    request: Request,
    response: Response,
    x_session_id: Optional[str] = Header(None),
    downloadie_session: Optional[str] = Cookie(None),
):
    """
    Initiate One-Click background download job to package all carousel slides
    into a zero-padded numbered ZIP archive with signed HMAC download URL.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, retry_after = rate_limiter.is_allowed(f"zip_{client_ip}")
    if not is_allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Download rate limit reached. Please wait {retry_after} seconds.",
        )

    session_id = get_or_set_session_id(request, response, x_session_id, downloadie_session)
    try:
        return await instagram_service.create_carousel_download_job(req.url, session_id=session_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get("/downloads/{job_id}", response_model=CarouselJobResponse)
async def get_carousel_job_status(job_id: str):
    """Poll the status and progress of a carousel ZIP bundling job."""
    return await instagram_service.get_carousel_job_status(job_id)
