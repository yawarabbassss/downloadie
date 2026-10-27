import os
import sys
import time
from fastapi import APIRouter
from app.core.config import settings
from app.services.storage import storage_manager

router = APIRouter(tags=["Health"])

START_TIME = time.time()


@router.get("/health")
async def health_check():
    """System health, uptime, and storage operational metrics."""
    uptime_seconds = round(time.time() - START_TIME, 1)
    storage_stats = storage_manager.get_storage_stats()

    # Provider configurations status
    configured_providers = []
    if settings.instagram_access_token:
        configured_providers.append("instagram")
    if settings.youtube_api_key:
        configured_providers.append("youtube")
    if settings.tiktok_client_key:
        configured_providers.append("tiktok")
    if settings.facebook_access_token:
        configured_providers.append("facebook")
    configured_providers.append("direct_media")

    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.app_env,
        "uptime_seconds": uptime_seconds,
        "python_version": sys.version.split()[0],
        "storage": storage_stats,
        "configured_providers": configured_providers,
    }
