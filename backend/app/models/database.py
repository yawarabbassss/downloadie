import datetime
from typing import Optional
from sqlalchemy import Column, DateTime, Integer, String, Text, Boolean, Float
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

Base = declarative_base()


def utcnow_factory():
    return datetime.datetime.now(datetime.timezone.utc)

class DownloadJobRecord(Base):
    """Database model for tracking download jobs and retention."""
    __tablename__ = "download_jobs"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=True)
    provider = Column(String(32), nullable=False)
    source_url_hash = Column(String(64), index=True, nullable=False)  # SHA-256 hash instead of raw url with tokens
    format_id = Column(String(32), default="original")
    status = Column(String(20), default="pending", index=True)
    progress_percent = Column(Integer, default=0)
    file_name = Column(String(255), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    storage_path = Column(String(512), nullable=True)
    error_code = Column(String(50), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow_factory, index=True)
    updated_at = Column(DateTime, default=utcnow_factory, onupdate=utcnow_factory)
    expires_at = Column(DateTime, nullable=True, index=True)


class UsageRecord(Base):
    """Anonymous aggregate usage metric record."""
    __tablename__ = "usage_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_hash = Column(String(64), index=True)
    provider = Column(String(32), index=True)
    action = Column(String(32))  # resolve, download
    success = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow_factory)


class ConnectedInstagramAccount(Base):
    """Secure record of connected Instagram Professional/Creator account."""
    __tablename__ = "connected_instagram_accounts"

    id = Column(String(64), primary_key=True, index=True)
    session_id = Column(String(64), index=True, nullable=False)
    instagram_user_id = Column(String(64), index=True, nullable=False)
    username = Column(String(64), index=True, nullable=False)
    name = Column(String(128), nullable=True)
    account_type = Column(String(32), default="BUSINESS")  # BUSINESS, CREATOR
    access_token_encrypted = Column(Text, nullable=False)
    scopes = Column(String(255), default="instagram_basic,instagram_manage_insights,pages_show_list")
    connected_at = Column(DateTime, default=utcnow_factory)
    token_expires_at = Column(DateTime, nullable=True)
    last_synced_at = Column(DateTime, default=utcnow_factory)


class InstagramProfileSnapshot(Base):
    """Historical profile snapshot for accurate follower growth analytics."""
    __tablename__ = "instagram_profile_snapshots"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(64), index=True, nullable=False)
    display_name = Column(String(128), nullable=True)
    follower_count = Column(Integer, nullable=False, default=0)
    following_count = Column(Integer, nullable=False, default=0)
    media_count = Column(Integer, nullable=False, default=0)
    is_verified = Column(Boolean, default=False)
    biography = Column(Text, nullable=True)
    profile_pic_url = Column(Text, nullable=True)
    source = Column(String(32), default="public_snapshot")  # public_snapshot, meta_graph_api, sample_verified
    created_at = Column(DateTime, default=utcnow_factory, index=True)


class InstagramMediaRecord(Base):
    """Metadata and engagement metrics for analyzed Instagram media."""
    __tablename__ = "instagram_media_records"

    id = Column(String(64), primary_key=True, index=True)  # Shortcode or Media ID
    username = Column(String(64), index=True, nullable=False)
    media_type = Column(String(32), default="IMAGE")  # IMAGE, VIDEO, CAROUSEL
    caption = Column(Text, nullable=True)
    permalink = Column(String(512), nullable=False)
    thumbnail_url = Column(Text, nullable=True)
    like_count = Column(Integer, nullable=True)
    comment_count = Column(Integer, nullable=True)
    view_count = Column(Integer, nullable=True)
    reach_count = Column(Integer, nullable=True)
    shares_count = Column(Integer, nullable=True)
    saves_count = Column(Integer, nullable=True)
    engagement_rate = Column(Float, nullable=True)
    carousel_items_json = Column(Text, nullable=True)
    published_at = Column(DateTime, nullable=True)
    last_refreshed_at = Column(DateTime, default=utcnow_factory)


class CarouselDownloadJobRecord(Base):
    """Dedicated tracking for one-click Instagram carousel ZIP bundling jobs."""
    __tablename__ = "carousel_download_jobs"

    id = Column(String(64), primary_key=True, index=True)
    shortcode = Column(String(64), index=True, nullable=False)
    post_url = Column(String(512), nullable=False)
    total_items = Column(Integer, default=0)
    completed_items = Column(Integer, default=0)
    status = Column(String(32), default="pending", index=True)  # pending, downloading, zipping, ready, failed, expired
    progress_percent = Column(Integer, default=0)
    archive_file_name = Column(String(255), nullable=True)
    archive_size_bytes = Column(Integer, nullable=True)
    storage_path = Column(String(512), nullable=True)
    download_url = Column(String(512), nullable=True)
    error_message = Column(Text, nullable=True)
    failed_items_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow_factory, index=True)
    expires_at = Column(DateTime, nullable=True, index=True)


engine = create_async_engine(
    settings.database_url,
    echo=False,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db() -> None:
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
