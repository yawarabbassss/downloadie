import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.api.routes_downloads import router as downloads_router
from app.api.routes_health import router as health_router
from app.api.routes_providers import router as providers_router
from app.api.routes_resolve import router as resolve_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.models.database import init_db
from app.services.storage import storage_manager

setup_logging(debug=settings.debug)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds essential security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown hooks."""
    # Startup: initialize database
    try:
        await init_db()
    except Exception as exc:
        print(f"[Warning] Database initialization notice: {exc}")

    # Startup: initial cleanup of expired temporary files
    storage_manager.cleanup_expired_files()

    # Background task for periodic cleanup every 15 minutes
    async def periodic_cleanup():
        while True:
            await asyncio.sleep(15 * 60)
            try:
                storage_manager.cleanup_expired_files()
            except Exception:
                pass

    cleanup_task = asyncio.create_task(periodic_cleanup())

    yield

    # Shutdown
    cleanup_task.cancel()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Downloadie Multi-Platform Media Downloader API — Secure, Honest, and Privacy-Conscious.",
    docs_url=f"{settings.api_prefix}/docs",
    redoc_url=f"{settings.api_prefix}/redoc",
    openapi_url=f"{settings.api_prefix}/openapi.json",
    lifespan=lifespan,
)

# Security Headers
app.add_middleware(SecurityHeadersMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Structured JSON error response avoiding stack trace leak."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred while processing your request. Please try again later.",
        },
    )


# Register Routers
app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(providers_router, prefix=settings.api_prefix)
app.include_router(resolve_router, prefix=settings.api_prefix)
app.include_router(downloads_router, prefix=settings.api_prefix)


@app.get("/")
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": f"{settings.api_prefix}/docs",
        "health": f"{settings.api_prefix}/health",
    }
