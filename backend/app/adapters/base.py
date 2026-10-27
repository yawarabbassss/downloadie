from abc import ABC, abstractmethod
from typing import Optional, Tuple
from app.models.schemas import (
    MediaResolutionResult,
    ProviderCapabilityInfo,
    ProviderType,
    DownloadJobResponse,
    MediaFormatOption,
)


class BaseProviderAdapter(ABC):
    """Abstract base class for all content platform adapters."""

    @property
    @abstractmethod
    def provider_id(self) -> ProviderType:
        """Unique provider identifier."""
        pass

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable provider name."""
        pass

    @abstractmethod
    def can_handle(self, url: str) -> bool:
        """Return True if this adapter recognizes the URL pattern."""
        pass

    @abstractmethod
    def validate_url(self, url: str) -> Tuple[bool, Optional[str]]:
        """Validate URL syntax, domain, and platform-specific structure."""
        pass

    @abstractmethod
    def get_capabilities(self) -> ProviderCapabilityInfo:
        """Return declared capabilities, operational status, and limitations."""
        pass

    @abstractmethod
    async def resolve_media(
        self,
        url: str,
        auth_context: Optional[dict] = None,
    ) -> MediaResolutionResult:
        """
        Resolve metadata, preview, and format availability for the URL.
        Must return structured info or transparently explain restrictions.
        """
        pass

    @abstractmethod
    async def create_download(
        self,
        url: str,
        format_id: Optional[str] = "original",
        item_index: Optional[int] = None,
        job_id: Optional[str] = None,
    ) -> DownloadJobResponse:
        """Initiate or execute authorized media download."""
        pass

    @abstractmethod
    async def get_job_status(self, job_id: str) -> DownloadJobResponse:
        """Check status of a running or completed download job."""
        pass
