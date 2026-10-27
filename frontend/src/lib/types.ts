export type ProviderType =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "facebook"
  | "direct_media"
  | "unknown";

export type MediaType = "video" | "image" | "audio" | "carousel" | "unknown";

export type CapabilityStatus =
  | "active"
  | "requires_api_key"
  | "requires_user_auth"
  | "terms_restricted"
  | "unsupported";

export interface ProviderCapabilityInfo {
  provider_id: ProviderType;
  name: string;
  description: string;
  status: CapabilityStatus;
  is_configured: boolean;
  supported_media_types: MediaType[];
  supports_download: boolean;
  supports_metadata: boolean;
  requires_credentials: boolean;
  credential_instructions?: string | null;
  official_alternative_url?: string | null;
  policy_notice: string;
}

export interface MediaFormatOption {
  format_id: string;
  label: string;
  mime_type: string;
  extension: string;
  quality?: string | null;
  file_size_bytes?: number | null;
  is_direct_stream: boolean;
}

export interface CarouselItem {
  item_index: number;
  media_type: MediaType;
  url: string;
  thumbnail_url?: string | null;
  title?: string | null;
  formats: MediaFormatOption[];
}

export interface MediaResolutionResult {
  url: string;
  provider: ProviderType;
  provider_name: string;
  status: CapabilityStatus;
  title?: string | null;
  caption?: string | null;
  author?: string | null;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
  media_type: MediaType;
  formats: MediaFormatOption[];
  carousel_items: CarouselItem[];
  can_download: boolean;
  notice_message?: string | null;
  official_alternative_url?: string | null;
  expires_at?: string | null;
}

export type JobStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed"
  | "expired";

export interface DownloadJobResponse {
  job_id: string;
  status: JobStatus;
  provider: ProviderType;
  progress_percent: number;
  download_url?: string | null;
  stream_url?: string | null;
  file_name?: string | null;
  file_size_bytes?: number | null;
  mime_type?: string | null;
  created_at: string;
  expires_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
}
