"use client";

import React from "react";
import { ShieldCheck, Zap, Lock, Sparkles } from "lucide-react";
import { UrlInputForm } from "./UrlInputForm";
import { MediaResultCard } from "./MediaResultCard";
import { MediaResolutionResult } from "@/lib/types";

interface HeroSectionProps {
  onCheckUrl: (url: string) => Promise<void>;
  isLoading: boolean;
  result: MediaResolutionResult | null;
  onReset: () => void;
}

export function HeroSection({ onCheckUrl, isLoading, result, onReset }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50/80 via-white to-white">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-brand-600" />
          <span>Independent &amp; Privacy-Conscious Media Downloader</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
          Your Favorite Content.{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-500">
            Ready to Download.
          </span>
        </h1>

        {/* Hero Supporting Copy */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Paste a supported media link to discover available download options for content you own or are authorized to save.
        </p>

        {/* Input Form Area */}
        <div className="mt-10">
          <UrlInputForm onCheckUrl={onCheckUrl} isLoading={isLoading} />
        </div>

        {/* Result Area */}
        {result && (
          <div className="mt-8">
            <MediaResultCard result={result} onReset={onReset} />
          </div>
        )}

        {/* Privacy Reassurance Below Input */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-brand-600" />
            No account or login required
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Zero password or credential harvesting
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            SSRF-protected ephemeral streaming
          </span>
        </div>
      </div>
    </section>
  );
}
