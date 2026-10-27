from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, HttpUrl


class ProviderType(str, Enum):
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    FACEBOOK = "facebook"
    DIRECT_MEDIA = "direct_media"
    UNKNOWN = "unknown"


class MediaType(str, Enum):
    VIDEO = "video"
    IMAGE = "image"
    AUDIO = "audio"
    CAROUSEL = "carousel"
    UNKNOWN = "unknown"


class CapabilityStatus(str, Enum):
    ACTIVE = "active"
    REQUIRES_API_KEY = "requires_api_key"
    REQUIRES_USER_AUTH = "requires_user_auth"
    TERMS_RESTRICTED = "terms_restricted"
    UNSUPPORTED = "unsupported"


class ProviderCapabilityInfo(BaseModel):
    """Detailed capability information for a content provider."""
    provider_id: ProviderType
    name: str
    description: str
    status: CapabilityStatus
    is_configured: bool
    supported_media_types: List[MediaType]
    supports_download: bool
    supports_metadata: bool
    requires_credentials: bool
    credential_instructions: Optional[str] = None
    official_alternative_url: Optional[str] = None
    policy_notice: str


class MediaFormatOption(BaseModel):
    """Available download format/quality for an item."""
    format_id: str = Field(..., description="Unique format identifier (e.g., 'original', '720p', 'mp3')")
    label: str = Field(..., description="Human-readable label (e.g., '1080p MP4 Video')")
    mime_type: str = Field(..., description="MIME content type")
    extension: str = Field(..., description="File extension with leading dot (.mp4)")
    quality: Optional[str] = Field(None, description="Quality descriptor (e.g. '1080p', 'High')")
    file_size_bytes: Optional[int] = Field(None, description="Known or estimated file size in bytes")
    is_direct_stream: bool = Field(True, description="Whether the media can be streamed directly")


class CarouselItem(BaseModel):
    """Individual item in a multi-image or multi-video post."""
    item_index: int
    media_type: MediaType
    url: str
    thumbnail_url: Optional[str] = None
    title: Optional[str] = None
    formats: List[MediaFormatOption] = Field(default_factory=list)


class MediaResolutionResult(BaseModel):
    """Result of resolving a media URL."""
    url: str
    provider: ProviderType
    provider_name: str
    status: CapabilityStatus
    title: Optional[str] = None
    caption: Optional[str] = None
    author: Optional[str] = None
    thumbnail_url: Optional[str] = None
    duration_seconds: Optional[float] = None
    media_type: MediaType
    formats: List[MediaFormatOption] = Field(default_factory=list)
    carousel_items: List[CarouselItem] = Field(default_factory=list)
    can_download: bool
    notice_message: Optional[str] = None
    official_alternative_url: Optional[str] = None
    expires_at: Optional[str] = None


class ResolveUrlRequest(BaseModel):
    """Request payload for resolving a media link."""
    url: str = Field(..., min_length=4, max_length=2048, description="URL of the media or post")


class CreateDownloadRequest(BaseModel):
    """Request to initiate a download job."""
    url: str = Field(..., description="Original or resolved media URL")
    format_id: Optional[str] = Field(default="original", description="Target format ID")
    item_index: Optional[int] = Field(default=None, description="Index if resolving a carousel item")


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    EXPIRED = "expired"


class DownloadJobResponse(BaseModel):
    """Status and details of a download job."""
    job_id: str
    status: JobStatus
    provider: ProviderType
    progress_percent: int = 0
    download_url: Optional[str] = None
    stream_url: Optional[str] = None
    file_name: Optional[str] = None
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    created_at: str
    expires_at: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
