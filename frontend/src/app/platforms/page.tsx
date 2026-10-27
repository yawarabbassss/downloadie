import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import {
  FileVideo,
  Instagram,
  Youtube,
  Video,
  Facebook,
  CheckCircle2,
  Key,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Supported Platforms & Status — Downloadie",
  description:
    "Explore the supported media providers on Downloadie. Transparent status, developer API requirements, and platform capabilities.",
};

export default function PlatformsPage() {
  const platforms = [
    {
      id: "direct",
      name: "Direct Media Files",
      badge: "Active & Instant",
      badgeVariant: "active",
      icon: <FileVideo className="h-6 w-6 text-brand-600" />,
      summary: "Full end-to-end support for direct HTTP/HTTPS media URLs.",
      formats: ["MP4 Video", "WEBM Video", "MOV Video", "MP3 Audio", "WAV Audio", "JPG/PNG/WEBP Images"],
      authRequirement: "None. Works anonymously with strict SSRF defense.",
      limitations: "Max file size 150 MB. Disallows private subnets, cloud metadata, and loopback IP addresses.",
    },
    {
      id: "instagram",
      name: "Instagram",
      badge: "Requires Meta Token",
      badgeVariant: "key",
      icon: <Instagram className="h-6 w-6 text-pink-600" />,
      summary: "Inspect Reels, feed posts, carousels, and stories via the official Meta Graph API.",
      formats: ["Reels", "Feed Posts", "Multi-Item Carousels", "Stories (Ephemeral)"],
      authRequirement: "Requires configured INSTAGRAM_ACCESS_TOKEN from Meta for Developers.",
      limitations: "No private account scraping, no session cookie harvesting, and no login wall circumvention.",
    },
    {
      id: "youtube",
      name: "YouTube",
      badge: "Terms Restricted",
      badgeVariant: "restricted",
      icon: <Youtube className="h-6 w-6 text-red-600" />,
      summary: "Official metadata inspection and YouTube Studio creator offline download workflows.",
      formats: ["Video Metadata (Data API v3)", "Creator Studio Original Files"],
      authRequirement: "Requires Google Cloud YOUTUBE_API_KEY for metadata lookup.",
      limitations: "Direct automated stream downloading is restricted by YouTube Terms of Service. Creators are directed to YouTube Studio.",
    },
    {
      id: "tiktok",
      name: "TikTok",
      badge: "Developer API Mode",
      badgeVariant: "key",
      icon: <Video className="h-6 w-6 text-cyan-600" />,
      summary: "Integration with official TikTok for Developers Display API.",
      formats: ["Authorized Creator Videos"],
      authRequirement: "Requires registered TikTok Developer credentials (TIKTOK_CLIENT_KEY).",
      limitations: "No proxy-evading scrapers or watermark-stripping circumvention.",
    },
    {
      id: "facebook",
      name: "Facebook",
      badge: "Requires Page Token",
      badgeVariant: "key",
      icon: <Facebook className="h-6 w-6 text-blue-600" />,
      summary: "Official Page videos and authorized creator reels via Meta Graph API.",
      formats: ["Public Page Videos", "Authorized Reels"],
      authRequirement: "Requires FACEBOOK_ACCESS_TOKEN with Page Public Content Access.",
      limitations: "Cannot access private profiles or closed Facebook Groups.",
    },
  ];

  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-4">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
            <span>Honest Platform Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Supported Content Providers
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            Downloadie utilizes an extensible adapter architecture. Each provider has explicitly defined capabilities, authorization requirements, and security limitations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {platforms.map((p) => (
            <div
              key={p.id}
              className="p-8 rounded-2xl border border-surface-border bg-slate-50/50 hover:bg-white hover:shadow-lifted transition-all flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {p.icon}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                      p.badgeVariant === "active"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : p.badgeVariant === "key"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {p.badgeVariant === "active" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : p.badgeVariant === "key" ? (
                      <Key className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
                    )}
                    <span>{p.badge}</span>
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {p.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                    {p.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">Supported Assets: </span>
                    <span className="text-slate-600">{p.formats.join(", ")}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Authorization: </span>
                    <span className="text-slate-600">{p.authRequirement}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Policy Constraints: </span>
                    <span className="text-slate-500">{p.limitations}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <Link
                  href={`/platforms/${p.id}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <span>View detailed {p.name} adapter guide</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
