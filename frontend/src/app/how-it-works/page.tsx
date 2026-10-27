import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  Link as LinkIcon,
  ShieldCheck,
  Server,
  Download,
  Lock,
  Layers,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — Downloadie",
  description:
    "Discover how Downloadie validates media links, enforces SSRF security, processes streams, and safely manages temporary media files.",
};

export default function HowItWorksPage() {
  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-4">
            <Server className="h-3.5 w-3.5 text-brand-600" />
            <span>Architecture &amp; Data Flow</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Downloadie Works Under the Hood
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            A production-minded, privacy-preserving media inspection engine engineered to deliver seamless downloads without deceptive practices.
          </p>
        </div>

        {/* Detailed Architecture Steps */}
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-surface-border">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 shadow-2xs font-mono font-bold text-lg">
                1
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                URL Input &amp; Platform Detection
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When a visitor submits a link, our frontend conducts initial syntax validation using RFC-compliant URL parsing. The URL is routed to our Provider Registry, which identifies whether the link belongs to Instagram, YouTube, TikTok, Facebook, or a Direct Media link.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Regex Domain Matching</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Scheme Enforcement (HTTPS)</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-surface-border">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-2xs font-mono font-bold text-lg">
                2
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                Server-Side SSRF &amp; Security Verification
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                To prevent Server-Side Request Forgery (SSRF) and DNS rebinding attacks, every outbound connection is rigorously vetted. Our security engine resolves host IP addresses and blocks any requests attempting to reach private IPv4/IPv6 subnets, loopbacks, internal hostnames, or cloud metadata endpoints (e.g. 169.254.169.254).
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">RFC 1918 Private IP Blocking</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Multi-Hop Redirect Inspection</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Port Allowlisting</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-surface-border">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 shadow-2xs font-mono font-bold text-lg">
                3
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                Capability Resolution &amp; Honest Disclosure
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The designated adapter probes the media resource. For direct media, it sends an asynchronous HEAD request to inspect Content-Type and Content-Length. For third-party platforms, it checks whether official API tokens or permissions are available. If an operation cannot be supported due to platform restrictions, Downloadie explains why honestly.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">MIME Type Verification</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Size Limit Check (&le;150MB)</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Zero Mock Downloads</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col md:flex-row gap-6 p-6 sm:p-8 rounded-2xl bg-slate-50 border border-surface-border">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-accent-500 shadow-2xs font-mono font-bold text-lg">
                4
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900">
                Streaming &amp; Ephemeral Retention
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When a download job starts, media is streamed in isolated chunks. Download links are protected by time-bound cryptographic HMAC tokens. Ephemeral storage is automatically pruned every 15 minutes, permanently discarding any files older than 60 minutes.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">HMAC Token Expiration</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Sanitized Filenames</span>
                <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">Automatic 60-Min Purge</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            href="/#url-input-section"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-brand-700 shadow-sm transition-colors"
          >
            Try It Now with a Media Link
          </Link>
        </div>
      </div>
    </div>
  );
}
