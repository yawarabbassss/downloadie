import os
from typing import List, Optional
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Downloadie Application Configuration Settings."""

    # Application Information
    app_name: str = "Downloadie API"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = False
    api_prefix: str = "/api"

    # Server & CORS
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    # Security & Limits
    secret_key: str = "downloadie-dev-secret-key-change-in-production-12345678"
    max_download_size_bytes: int = 150 * 1024 * 1024  # 150 MB default safety ceiling
    request_timeout_seconds: float = 20.0
    rate_limit_per_minute: int = 45
    rate_limit_burst: int = 10
    allow_private_networks_for_tests: bool = False

    # Storage & Cleanup
    storage_dir: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data", "downloads")
    job_expiration_minutes: int = 60
    max_storage_quota_mb: int = 2048  # 2 GB total ephemeral cache limit

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/downloadie.db"

    # Optional Provider Credentials (official APIs)
    instagram_access_token: Optional[str] = None
    youtube_api_key: Optional[str] = None
    tiktok_client_key: Optional[str] = None
    tiktok_client_secret: Optional[str] = None
    facebook_access_token: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

# Ensure local storage directory exists
os.makedirs(settings.storage_dir, exist_ok=True)
os.makedirs(os.path.dirname(settings.storage_dir), exist_ok=True)
