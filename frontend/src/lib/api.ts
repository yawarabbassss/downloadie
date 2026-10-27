import {
  CarouselJobResponse,
  CarouselResolveResponse,
  DownloadJobResponse,
  InstagramAnalysisResponse,
  InstagramConnectedAccountInfo,
  InstagramGrowthAnalytics,
  MediaResolutionResult,
  ProviderCapabilityInfo,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchProviders(): Promise<ProviderCapabilityInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/api/providers`, {
      method: "GET",
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch providers: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.error("fetchProviders error:", error);
    return [];
  }
}

export async function resolveMediaUrl(url: string): Promise<MediaResolutionResult> {
  const res = await fetch(`${API_BASE}/api/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Resolution failed (${res.status})`);
  }

  return await res.json();
}

export async function createDownload(
  url: string,
  formatId = "original",
  itemIndex?: number
): Promise<DownloadJobResponse> {
  const res = await fetch(`${API_BASE}/api/downloads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      url,
      format_id: formatId,
      item_index: itemIndex,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Download initiation failed (${res.status})`);
  }

  return await res.json();
}

export async function pollJobStatus(jobId: string): Promise<DownloadJobResponse> {
  const res = await fetch(`${API_BASE}/api/downloads/${jobId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Status poll failed (${res.status})`);
  }

  return await res.json();
}

// ==========================================
// Instagram Profile Analyzer API
// ==========================================

export async function analyzeInstagramProfile(
  usernameOrUrl: string,
  forceRefresh = false
): Promise<InstagramAnalysisResponse> {
  const res = await fetch(`${API_BASE}/api/instagram/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      username_or_url: usernameOrUrl,
      force_refresh: forceRefresh,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Profile analysis failed (${res.status})`);
  }

  return await res.json();
}

export async function fetchProfileGrowth(
  username: string,
  days = 30
): Promise<InstagramGrowthAnalytics> {
  const res = await fetch(`${API_BASE}/api/instagram/profiles/${encodeURIComponent(username)}/growth?days=${days}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Growth fetch failed (${res.status})`);
  }

  return await res.json();
}

export async function startInstagramAuth(): Promise<{ auth_url: string; state: string; is_configured: boolean; setup_instructions?: string }> {
  const res = await fetch(`${API_BASE}/api/instagram/auth/start`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to initiate Meta OAuth authorization.");
  }
  return await res.json();
}

export async function getConnectedInstagramAccount(): Promise<InstagramConnectedAccountInfo> {
  try {
    const res = await fetch(`${API_BASE}/api/instagram/connected`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return { is_connected: false };
    return await res.json();
  } catch {
    return { is_connected: false };
  }
}

export async function disconnectInstagramAccount(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/instagram/disconnect`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to disconnect Instagram account.");
  }
  return await res.json();
}

// ==========================================
// One-Click Instagram Carousel Downloader API
// ==========================================

export async function resolveInstagramCarousel(url: string): Promise<CarouselResolveResponse> {
  const res = await fetch(`${API_BASE}/api/instagram/carousels/resolve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Carousel resolution failed (${res.status})`);
  }

  return await res.json();
}

export async function downloadInstagramCarousel(url: string): Promise<CarouselJobResponse> {
  const res = await fetch(`${API_BASE}/api/instagram/carousels/download`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Carousel download initiation failed (${res.status})`);
  }

  return await res.json();
}

export async function pollCarouselJobStatus(jobId: string): Promise<CarouselJobResponse> {
  const res = await fetch(`${API_BASE}/api/instagram/downloads/${jobId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Carousel status poll failed (${res.status})`);
  }

  return await res.json();
}
