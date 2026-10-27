"use client";

import React, { useState } from "react";
import { HeroSection } from "@/components/HeroSection";
import { PlatformSelector } from "@/components/PlatformSelector";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { FaqSection } from "@/components/FaqSection";
import { resolveMediaUrl } from "@/lib/api";
import { MediaResolutionResult } from "@/lib/types";

export default function HomePage() {
  const [result, setResult] = useState<MediaResolutionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckUrl = async (url: string) => {
    setIsLoading(true);
    try {
      const res = await resolveMediaUrl(url);
      setResult(res);
    } catch (err: any) {
      setResult({
        url,
        provider: "unknown",
        provider_name: "Resolution Error",
        status: "unsupported",
        media_type: "unknown",
        formats: [],
        carousel_items: [],
        can_download: false,
        notice_message: err.message || "Failed to inspect the submitted URL. Please check network connectivity or try another link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeroSection
        onCheckUrl={handleCheckUrl}
        isLoading={isLoading}
        result={result}
        onReset={handleReset}
      />
      <PlatformSelector />
      <HowItWorksSection />
      <FeaturesSection />
      <FaqSection />
    </div>
  );
}
