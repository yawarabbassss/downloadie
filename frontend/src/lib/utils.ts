import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProviderType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes?: number | null, decimals = 1): string {
  if (!bytes || bytes === 0) return "Unknown size";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSeconds(seconds?: number | null): string {
  if (!seconds || seconds <= 0) return "";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function detectProviderFromUrl(url: string): {
  provider: ProviderType;
  label: string;
  iconName: string;
} {
  if (!url) return { provider: "unknown", label: "", iconName: "Link" };
  const lower = url.trim().toLowerCase();

  if (lower.includes("instagram.com") || lower.includes("instagr.am")) {
    return { provider: "instagram", label: "Instagram Link Detected", iconName: "Instagram" };
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return { provider: "youtube", label: "YouTube Video Detected", iconName: "Youtube" };
  }
  if (lower.includes("tiktok.com")) {
    return { provider: "tiktok", label: "TikTok Video Detected", iconName: "Video" };
  }
  if (lower.includes("facebook.com") || lower.includes("fb.watch")) {
    return { provider: "facebook", label: "Facebook Media Detected", iconName: "Facebook" };
  }

  const directExtensions = [
    ".mp4", ".webm", ".mov", ".mkv", ".m4v",
    ".mp3", ".wav", ".m4a", ".ogg", ".flac",
    ".jpg", ".jpeg", ".png", ".webp", ".gif"
  ];

  if (directExtensions.some((ext) => lower.includes(ext))) {
    return { provider: "direct_media", label: "Direct Media Link Detected", iconName: "FileVideo" };
  }

  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    return { provider: "direct_media", label: "Web Media URL", iconName: "Globe" };
  }

  return { provider: "unknown", label: "", iconName: "Link" };
}
