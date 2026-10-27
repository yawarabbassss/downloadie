"use client";

import React from "react";
import Link from "next/link";
import {
  Instagram,
  Youtube,
  Video,
  Facebook,
  FileVideo,
  CheckCircle2,
  Key,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

interface PlatformCardData {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  statusBadge: {
    label: string;
    variant: "active" | "requires_key" | "restricted";
  };
  supportedTypes: string[];
  honestNote: string;
}

const PLATFORMS: PlatformCardData[] = [
  {
    id: "direct",
    name: "Direct Media Files",
    icon: <FileVideo className="h-6 w-6 text-brand-600" />,
    description: "Download verified MP4, WEBM, MOV, MP3, WAV, JPG, PNG, and WEBP files directly with SSRF protection.",
    statusBadge: {
      label: "Active & Instant",
      variant: "active",
    },
    supportedTypes: ["Video (MP4, WEBM)", "Audio (MP3, WAV)", "Images (JPG, PNG, WEBP)"],
    honestNote: "Fully functional out-of-the-box with chunked streaming and file size validation.",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-6 w-6 text-pink-600" />,
    description: "Reels, feed posts, carousels, and stories via the official Meta Graph API.",
    statusBadge: {
      label: "Requires Meta Token",
      variant: "requires_key",
    },
    supportedTypes: ["Reels", "Posts & Carousels", "Stories (Ephemeral)"],
    honestNote: "Honors privacy settings. No private account scraping or session cookie harvesting.",
  },
  {
    id: "youtube",
    name: "YouTube",
    icon: <Youtube className="h-6 w-6 text-red-600" />,
    description: "Video metadata inspection and official YouTube Studio creator offline download workflows.",
    statusBadge: {
      label: "Terms Restricted",
      variant: "restricted",
    },
    supportedTypes: ["Metadata Inspection", "Creator Studio Workflows"],
    honestNote: "Direct stream ripping is prohibited by YouTube's Terms of Service. Downloadie respects intellectual property.",
  },
  {
    id: "tiktok",
    name: "TikTok",
    icon: <Video className="h-6 w-6 text-cyan-600" />,
    description: "Authorized developer workflows using TikTok for Developers Display API.",
    statusBadge: {
      label: "Developer API Mode",
      variant: "requires_key",
    },
    supportedTypes: ["Public Creator Videos via API"],
    honestNote: "Watermark circumvention and proxy evasion are strictly prohibited.",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: <Facebook className="h-6 w-6 text-blue-600" />,
    description: "Public Page videos and authorized creator reels via Meta Graph API.",
    statusBadge: {
      label: "Requires Page Token",
      variant: "requires_key",
    },
    supportedTypes: ["Page Videos", "Authorized Reels"],
    honestNote: "Does not bypass private group permissions or user authentication walls.",
  },
];

export function PlatformSelector() {
  const getBadgeClass = (variant: PlatformCardData["statusBadge"]["variant"]) => {
    switch (variant) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "requires_key":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "restricted":
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getBadgeIcon = (variant: PlatformCardData["statusBadge"]["variant"]) => {
    switch (variant) {
      case "active":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case "requires_key":
        return <Key className="h-3.5 w-3.5 text-amber-600" />;
      case "restricted":
        return <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <section id="platforms" className="py-16 md:py-24 bg-slate-50/50 border-t border-b border-surface-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
            Multi-Platform Architecture
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Supported Content Providers &amp; Real Status
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            We believe in complete transparency. Below is the honest operational status for each provider adapter in Downloadie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className="flex flex-col justify-between p-6 bg-white rounded-2xl border border-surface-border shadow-card hover:shadow-lifted hover:border-brand-200 transition-all group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-brand-50/50 transition-colors">
                    {platform.icon}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getBadgeClass(
                      platform.statusBadge.variant
                    )}`}
                  >
                    {getBadgeIcon(platform.statusBadge.variant)}
                    <span>{platform.statusBadge.label}</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {platform.name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {platform.description}
                  </p>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Capabilities:
                  </span>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {platform.supportedTypes.map((st, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <p className="text-[11px] text-slate-500 italic leading-snug">
                  {platform.honestNote}
                </p>
                <Link
                  href={`/platforms/${platform.id}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>Read platform guide &amp; integration docs</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
