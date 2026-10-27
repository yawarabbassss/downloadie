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


# ==========================================
# Instagram Profile Analyzer Schemas
# ==========================================

class InstagramAnalyzeRequest(BaseModel):
    username_or_url: str = Field(..., min_length=1, max_length=255, description="Instagram username or profile URL")
    force_refresh: bool = Field(False, description="Whether to bypass cache and refresh data")


class InstagramProfileOverview(BaseModel):
    username: str
    display_name: Optional[str] = None
    biography: Optional[str] = None
    profile_picture_url: Optional[str] = None
    is_verified: Optional[bool] = None
    follower_count: Optional[int] = None
    following_count: Optional[int] = None
    media_count: Optional[int] = None
    account_type: Optional[str] = "Personal / Public"
    profile_url: str
    last_refreshed_at: str
    is_connected_account: bool = False
    data_source: str = "public_profile"  # "meta_graph_api", "public_snapshot", "sample_profile"
    authorization_status: str = "unauthenticated"  # "connected_professional", "public_limited", "sample_profile"


class InstagramMetricDetail(BaseModel):
    label: str
    value: Optional[float] = None
    formatted_value: str
    source: str  # "public_metric", "meta_graph_api", "estimated", "insufficient_data"
    is_authorized_only: bool = False
    tooltip: str
    formula: Optional[str] = None


class InstagramPerformanceMetrics(BaseModel):
    follower_count: InstagramMetricDetail
    following_count: InstagramMetricDetail
    media_count: InstagramMetricDetail
    avg_likes: InstagramMetricDetail
    avg_comments: InstagramMetricDetail
    public_engagement_rate: InstagramMetricDetail
    verified_reach: Optional[InstagramMetricDetail] = None
    verified_impressions: Optional[InstagramMetricDetail] = None
    verified_saves: Optional[InstagramMetricDetail] = None
    verified_shares: Optional[InstagramMetricDetail] = None
    verified_accounts_engaged: Optional[InstagramMetricDetail] = None


class InstagramMediaItem(BaseModel):
    id: str
    media_type: str  # "IMAGE", "VIDEO", "CAROUSEL"
    caption: Optional[str] = None
    permalink: str
    thumbnail_url: Optional[str] = None
    published_at: Optional[str] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    views: Optional[int] = None
    reach: Optional[int] = None
    shares: Optional[int] = None
    saves: Optional[int] = None
    engagement_rate: Optional[float] = None
    carousel_slide_count: Optional[int] = None
    ranking_metric: Optional[str] = None


class InstagramGrowthPoint(BaseModel):
    date: str
    timestamp: int
    follower_count: int
    following_count: int
    media_count: int
    daily_net_change: Optional[int] = None


class InstagramGrowthAnalytics(BaseModel):
    current_followers: int
    starting_followers: int
    net_follower_change: int
    percentage_growth: float
    daily_average_net_change: float
    available_days: int
    snapshot_count: int
    date_range_label: str
    history_points: List[InstagramGrowthPoint] = Field(default_factory=list)
    notice: str


class InstagramAnalysisResponse(BaseModel):
    profile: InstagramProfileOverview
    performance: InstagramPerformanceMetrics
    growth: InstagramGrowthAnalytics
    media: List[InstagramMediaItem] = Field(default_factory=list)
    connected_account: bool = False
    notice: Optional[str] = None


class InstagramAuthStartResponse(BaseModel):
    auth_url: str
    state: str
    is_configured: bool = True
    setup_instructions: Optional[str] = None


class InstagramConnectedAccountInfo(BaseModel):
    is_connected: bool
    username: Optional[str] = None
    name: Optional[str] = None
    account_type: Optional[str] = None
    connected_at: Optional[str] = None
    scopes: List[str] = Field(default_factory=list)


# ==========================================
# Instagram Carousel Downloader Schemas
# ==========================================

class CarouselSlideInfo(BaseModel):
    slide_index: int
    media_type: MediaType
    url: str
    thumbnail_url: Optional[str] = None
    format_label: str
    extension: str
    file_size_bytes: Optional[int] = None


class CarouselResolveResponse(BaseModel):
    url: str
    shortcode: str
    total_slides: int
    slides: List[CarouselSlideInfo] = Field(default_factory=list)
    title: Optional[str] = None
    author: Optional[str] = None
    caption: Optional[str] = None
    thumbnail_url: Optional[str] = None
    can_download_all: bool = True
    notice_message: Optional[str] = None


class CarouselDownloadRequest(BaseModel):
    url: str = Field(..., min_length=4, max_length=2048, description="Instagram Carousel Post URL")


class CarouselJobResponse(BaseModel):
    job_id: str
    status: str  # "pending", "downloading", "zipping", "ready", "failed", "expired"
    progress_percent: int = 0
    total_items: int = 0
    completed_items: int = 0
    archive_name: Optional[str] = None
    archive_size_bytes: Optional[int] = None
    download_url: Optional[str] = None
    stream_url: Optional[str] = None
    error_message: Optional[str] = None
    failed_items: List[int] = Field(default_factory=list)
    expires_at: Optional[str] = None
