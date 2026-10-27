from typing import Dict, List, Optional
from app.adapters.base import BaseProviderAdapter
from app.adapters.direct_media import DirectMediaAdapter
from app.adapters.facebook import FacebookAdapter
from app.adapters.instagram import InstagramAdapter
from app.adapters.tiktok import TikTokAdapter
from app.adapters.youtube import YouTubeAdapter
from app.models.schemas import ProviderCapabilityInfo, ProviderType


class ProviderRegistry:
    """Registry managing all supported platform adapters."""

    def __init__(self):
        self._adapters: Dict[ProviderType, BaseProviderAdapter] = {}
        self._register_defaults()

    def _register_defaults(self) -> None:
        # Register in priority order (specific social platforms first, direct media fallback)
        self.register(InstagramAdapter())
        self.register(YouTubeAdapter())
        self.register(TikTokAdapter())
        self.register(FacebookAdapter())
        self.register(DirectMediaAdapter())

    def register(self, adapter: BaseProviderAdapter) -> None:
        self._adapters[adapter.provider_id] = adapter

    def get_adapter(self, provider_id: ProviderType | str) -> Optional[BaseProviderAdapter]:
        if isinstance(provider_id, str):
            try:
                provider_id = ProviderType(provider_id)
            except ValueError:
                return None
        return self._adapters.get(provider_id)

    def find_adapter_for_url(self, url: str) -> Optional[BaseProviderAdapter]:
        if not url:
            return None
        # Check specific platform adapters first
        social_order = [
            ProviderType.INSTAGRAM,
            ProviderType.YOUTUBE,
            ProviderType.TIKTOK,
            ProviderType.FACEBOOK,
        ]
        for pid in social_order:
            adapter = self._adapters.get(pid)
            if adapter and adapter.can_handle(url):
                return adapter

        # Fallback to direct media
        direct_adapter = self._adapters.get(ProviderType.DIRECT_MEDIA)
        if direct_adapter and direct_adapter.can_handle(url):
            return direct_adapter

        return None

    def list_all_capabilities(self) -> List[ProviderCapabilityInfo]:
        return [adapter.get_capabilities() for adapter in self._adapters.values()]


# Global registry singleton
registry = ProviderRegistry()
