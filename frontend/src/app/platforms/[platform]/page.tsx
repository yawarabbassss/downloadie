import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileVideo,
  Instagram,
  Youtube,
  Video,
  Facebook,
  CheckCircle2,
  Key,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

interface PlatformDetail {
  id: string;
  name: string;
  iconName: string;
  badge: string;
  badgeVariant: "active" | "key" | "restricted";
  overview: string;
  capabilities: { feature: string; status: "supported" | "requires_key" | "unsupported"; note: string }[];
  instructions: string[];
  policyNotice: string;
  officialLink?: string;
  officialLinkLabel?: string;
}

const PLATFORM_DATA: Record<string, PlatformDetail> = {
  direct: {
    id: "direct",
    name: "Direct Media Files",
    iconName: "FileVideo",
    badge: "Active & Instant",
    badgeVariant: "active",
    overview:
      "Downloadie provides full end-to-end streaming downloads for direct HTTP and HTTPS media files. You can save MP4, WEBM, MOV, MP3, WAV, JPG, PNG, and WEBP files hosted on any public web server or user-controlled storage bucket.",
    capabilities: [
      { feature: "Direct MP4 / WEBM Video URLs", status: "supported", note: "Streamed with chunked transfer and range headers." },
      { feature: "MP3 / WAV Audio URLs", status: "supported", note: "Instant download with sanitized filename." },
      { feature: "JPG / PNG / WEBP Image URLs", status: "supported", note: "Direct preview and download." },
      { feature: "Private Subnets & Loopback (127.0.0.1)", status: "unsupported", note: "Blocked by SSRF filter for server protection." },
      { feature: "Cloud Metadata (169.254.169.254)", status: "unsupported", note: "Strictly prohibited to defend internal cloud services." },
    ],
    instructions: [
      "Obtain the direct HTTP or HTTPS link to the media file.",
      "Paste the URL into the Downloadie search box.",
      "Click 'Check Link'. Downloadie will perform SSRF validation, check the Content-Type, and verify the file size.",
      "Click 'Download Media File' to receive the file safely.",
    ],
    policyNotice: "Ensure you have the right to download and store files from the target web server.",
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    iconName: "Instagram",
    badge: "Requires Meta Token",
    badgeVariant: "key",
    overview:
      "Downloadie's Instagram adapter interfaces with the official Meta Graph API. It is designed to inspect Reels, posts, carousels, and ephemeral Stories where authorized by the content owner or via a configured Meta Developer Access Token.",
    capabilities: [
      { feature: "Instagram Reels", status: "requires_key", note: "Requires configured Meta Graph API token." },
      { feature: "Feed Posts & Photos", status: "requires_key", note: "Resolved via Graph API." },
      { feature: "Carousels (Multi-Item)", status: "requires_key", note: "Parses each child asset separately." },
      { feature: "Stories", status: "requires_key", note: "Ephemeral. Only available with creator authorization." },
      { feature: "Private Accounts", status: "unsupported", note: "Private content cannot be scraped or accessed." },
      { feature: "Session Cookie Theft", status: "unsupported", note: "Strictly prohibited. We never ask for passwords." },
    ],
    instructions: [
      "Configure your INSTAGRAM_ACCESS_TOKEN in the environment via Meta for Developers.",
      "Copy the post, reel, or story URL from Instagram.",
      "Paste the link into Downloadie to resolve media metadata.",
      "If unconfigured, Downloadie provides direct links to the official Instagram page.",
    ],
    policyNotice: "Downloadie does not employ unauthorized scrapers or evade Instagram access controls.",
    officialLink: "https://developers.facebook.com/docs/instagram-basic-display-api",
    officialLinkLabel: "Meta for Developers Documentation",
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    iconName: "Youtube",
    badge: "Terms Restricted",
    badgeVariant: "restricted",
    overview:
      "Downloadie provides metadata resolution for YouTube videos and Shorts using the official YouTube Data API v3. In strict compliance with YouTube's Terms of Service and digital rights policies, automated stream ripping of third-party videos is restricted.",
    capabilities: [
      { feature: "Video Metadata (Title, Channel, Thumbnails)", status: "requires_key", note: "Requires Google Cloud YOUTUBE_API_KEY." },
      { feature: "YouTube Shorts Metadata", status: "requires_key", note: "Supported via Data API." },
      { feature: "Creator Studio Master Downloads", status: "supported", note: "Content owners can download their videos via YouTube Studio." },
      { feature: "Direct Automated Stream Ripping", status: "unsupported", note: "Restricted by YouTube's Terms of Service." },
      { feature: "DRM Circumvention", status: "unsupported", note: "Strictly prohibited." },
    ],
    instructions: [
      "Paste a YouTube video or Shorts link into Downloadie.",
      "Inspect the title, channel details, and available official workflows.",
      "If you are the content creator, use the provided link to download your master file from YouTube Studio.",
    ],
    policyNotice: "Downloadie respects creator intellectual property and YouTube platform policies.",
    officialLink: "https://studio.youtube.com",
    officialLinkLabel: "Open YouTube Studio",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    iconName: "Video",
    badge: "Developer API Mode",
    badgeVariant: "key",
    overview:
      "Downloadie integrates with the official TikTok for Developers Display API. When configured with registered developer credentials, authorized videos can be inspected and downloaded cleanly.",
    capabilities: [
      { feature: "Creator Video Metadata", status: "requires_key", note: "Requires TikTok Display API approval." },
      { feature: "Authorized Video Downloads", status: "requires_key", note: "Via approved developer token." },
      { feature: "Watermark Circumvention Hacks", status: "unsupported", note: "Illicit watermark stripping is not supported." },
      { feature: "Proxy Evasion & Scrapers", status: "unsupported", note: "Strictly disallowed by design." },
    ],
    instructions: [
      "Register an application on the TikTok for Developers portal.",
      "Set TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in the Downloadie backend environment.",
      "Submit a valid TikTok video URL to inspect available developer options.",
    ],
    policyNotice: "Downloadie operates exclusively through official developer interfaces.",
    officialLink: "https://developers.tiktok.com",
    officialLinkLabel: "TikTok for Developers Portal",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    iconName: "Facebook",
    badge: "Requires Page Token",
    badgeVariant: "key",
    overview:
      "The Facebook adapter connects to the Meta Graph API to resolve public Page videos and authorized creator reels. It does not harvest private group data or personal profile media without explicit OAuth permissions.",
    capabilities: [
      { feature: "Public Page Videos", status: "requires_key", note: "Requires Page Public Content Access token." },
      { feature: "Authorized Reels", status: "requires_key", note: "Accessible via Graph API." },
      { feature: "Private Groups & Secret Profiles", status: "unsupported", note: "Not accessible without group admin authorization." },
      { feature: "Login Session Harvesting", status: "unsupported", note: "Strictly prohibited." },
    ],
    instructions: [
      "Obtain an authorized Meta Graph API token with Page Public Content Access.",
      "Configure FACEBOOK_ACCESS_TOKEN in your .env file.",
      "Paste the Facebook video link to verify metadata and stream options.",
    ],
    policyNotice: "Downloadie strictly upholds user privacy and Meta developer platform policies.",
    officialLink: "https://developers.facebook.com",
    officialLinkLabel: "Meta for Developers",
  },
};

export function generateStaticParams() {
  return [
    { platform: "direct" },
    { platform: "instagram" },
    { platform: "youtube" },
    { platform: "tiktok" },
    { platform: "facebook" },
  ];
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  const { platform } = await params;
  const detail = PLATFORM_DATA[platform.toLowerCase()];

  if (!detail) {
    notFound();
  }

  const renderIcon = () => {
    switch (detail.iconName) {
      case "Instagram":
        return <Instagram className="h-8 w-8 text-pink-600" />;
      case "Youtube":
        return <Youtube className="h-8 w-8 text-red-600" />;
      case "Video":
        return <Video className="h-8 w-8 text-cyan-600" />;
      case "Facebook":
        return <Facebook className="h-8 w-8 text-blue-600" />;
      default:
        return <FileVideo className="h-8 w-8 text-brand-600" />;
    }
  };

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Back navigation */}
        <Link
          href="/platforms"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to All Supported Platforms</span>
        </Link>

        {/* Header Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-surface-border">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              {renderIcon()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {detail.name} Downloader &amp; Adapter
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Comprehensive platform capability specification
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              detail.badgeVariant === "active"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : detail.badgeVariant === "key"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {detail.badgeVariant === "active" ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : detail.badgeVariant === "key" ? (
              <Key className="h-3.5 w-3.5 text-amber-600" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>{detail.badge}</span>
          </span>
        </div>

        {/* Overview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Overview</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {detail.overview}
          </p>
        </div>

        {/* Capability Matrix */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Capability Matrix</h2>
          <div className="overflow-hidden rounded-xl border border-surface-border">
            <table className="min-w-full divide-y divide-surface-border text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Feature</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Implementation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border bg-white text-slate-600">
                {detail.capabilities.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.feature}</td>
                    <td className="px-4 py-3">
                      {c.status === "supported" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                          Supported
                        </span>
                      ) : c.status === "requires_key" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700">
                          Requires API Token
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600">
                          Restricted / Policy
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workflow Instructions */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Workflow &amp; Usage</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 leading-relaxed bg-slate-50/80 p-5 rounded-xl border border-surface-border">
            {detail.instructions.map((inst, i) => (
              <li key={i}>{inst}</li>
            ))}
          </ol>
        </div>

        {/* Policy & Official Documentation */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <span>Policy &amp; Compliance Statement</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {detail.policyNotice}
          </p>
          {detail.officialLink && (
            <div className="pt-2">
              <a
                href={detail.officialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <span>{detail.officialLinkLabel || "Official Documentation"}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* CTA to test a link */}
        <div className="text-center pt-4">
          <Link
            href="/#url-input-section"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 shadow-sm transition-colors"
          >
            <span>Try {detail.name} Link on Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
