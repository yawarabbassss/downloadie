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

export interface InstagramProfileOverview {
  username: string;
  display_name?: string | null;
  biography?: string | null;
  profile_picture_url?: string | null;
  is_verified?: boolean | null;
  follower_count?: number | null;
  following_count?: number | null;
  media_count?: number | null;
  account_type?: string | null;
  profile_url: string;
  last_refreshed_at: string;
  is_connected_account: boolean;
  data_source: "public_profile" | "meta_graph_api" | "public_snapshot" | "sample_profile";
  authorization_status: "connected_professional" | "public_limited" | "sample_profile" | "unauthenticated";
}

export interface InstagramMetricDetail {
  label: string;
  value?: number | null;
  formatted_value: string;
  source: "public_metric" | "meta_graph_api" | "estimated" | "insufficient_data";
  is_authorized_only: boolean;
  tooltip: string;
  formula?: string | null;
}

export interface InstagramPerformanceMetrics {
  follower_count: InstagramMetricDetail;
  following_count: InstagramMetricDetail;
  media_count: InstagramMetricDetail;
  avg_likes: InstagramMetricDetail;
  avg_comments: InstagramMetricDetail;
  public_engagement_rate: InstagramMetricDetail;
  verified_reach?: InstagramMetricDetail | null;
  verified_impressions?: InstagramMetricDetail | null;
  verified_saves?: InstagramMetricDetail | null;
  verified_shares?: InstagramMetricDetail | null;
  verified_accounts_engaged?: InstagramMetricDetail | null;
}

export interface InstagramMediaItem {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL";
  caption?: string | null;
  permalink: string;
  thumbnail_url?: string | null;
  published_at?: string | null;
  likes?: number | null;
  comments?: number | null;
  views?: number | null;
  reach?: number | null;
  shares?: number | null;
  saves?: number | null;
  engagement_rate?: number | null;
  carousel_slide_count?: number | null;
  ranking_metric?: string | null;
}

export interface InstagramGrowthPoint {
  date: string;
  timestamp: number;
  follower_count: number;
  following_count: number;
  media_count: number;
  daily_net_change?: number | null;
}

export interface InstagramGrowthAnalytics {
  current_followers: number;
  starting_followers: number;
  net_follower_change: number;
  percentage_growth: number;
  daily_average_net_change: number;
  available_days: number;
  snapshot_count: number;
  date_range_label: string;
  history_points: InstagramGrowthPoint[];
  notice: string;
}

export interface InstagramAnalysisResponse {
  profile: InstagramProfileOverview;
  performance: InstagramPerformanceMetrics;
  growth: InstagramGrowthAnalytics;
  media: InstagramMediaItem[];
  connected_account: boolean;
  notice?: string | null;
}

export interface InstagramConnectedAccountInfo {
  is_connected: boolean;
  username?: string | null;
  name?: string | null;
  account_type?: string | null;
  connected_at?: string | null;
  scopes?: string[];
}

export interface CarouselSlideInfo {
  slide_index: number;
  media_type: MediaType;
  url: string;
  thumbnail_url?: string | null;
  format_label: string;
  extension: string;
  file_size_bytes?: number | null;
}

export interface CarouselResolveResponse {
  url: string;
  shortcode: string;
  total_slides: number;
  slides: CarouselSlideInfo[];
  title?: string | null;
  author?: string | null;
  caption?: string | null;
  thumbnail_url?: string | null;
  can_download_all: boolean;
  notice_message?: string | null;
}

export interface CarouselJobResponse {
  job_id: string;
  status: "pending" | "downloading" | "zipping" | "ready" | "failed" | "expired";
  progress_percent: number;
  total_items: number;
  completed_items: number;
  archive_name?: string | null;
  archive_size_bytes?: number | null;
  download_url?: string | null;
  stream_url?: string | null;
  error_message?: string | null;
  failed_items: number[];
  expires_at?: string | null;
}
