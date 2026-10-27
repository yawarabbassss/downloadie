import datetime
from typing import Optional
from sqlalchemy import Column, DateTime, Integer, String, Text, Boolean
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
