import React from "react";
import { Link as LinkIcon, SearchCheck, DownloadCloud } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      icon: <LinkIcon className="h-6 w-6 text-brand-600" />,
      title: "Paste a Link",
      description:
        "Copy your media link from Instagram, YouTube, TikTok, Facebook, or any direct media URL and paste it into the search box.",
    },
    {
      step: "02",
      icon: <SearchCheck className="h-6 w-6 text-brand-600" />,
      title: "Check Available Options",
      description:
        "Our backend detects the platform, runs strict SSRF and MIME validations, and retrieves authorized media metadata and available qualities.",
    },
    {
      step: "03",
      icon: <DownloadCloud className="h-6 w-6 text-brand-600" />,
      title: "Download Eligible Content",
      description:
        "If the media is eligible and authorized, download it instantly with secure, ephemeral streaming directly to your device.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
            Seamless &amp; Transparent
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            How Downloadie Works
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Three simple steps to inspect, verify, and download media safely without invasive tracking or deceptive tricks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, index) => (
            <div
              key={s.step}
              className="relative flex flex-col items-center text-center p-8 rounded-2xl bg-slate-50/70 border border-surface-border shadow-card hover:shadow-lifted transition-all"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-mono text-xs font-bold shadow-sm">
                Step {s.step}
              </div>

              {/* Icon */}
              <div className="mt-2 p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs mb-5">
                {s.icon}
              </div>

              {/* Title & Description */}
              <h4 className="text-lg font-bold text-slate-900 mb-2">
                {s.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
