import {
  DownloadJobResponse,
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
