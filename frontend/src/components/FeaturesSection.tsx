import React from "react";
import {
  Search,
  Eye,
  Sliders,
  ShieldCheck,
  Smartphone,
  Info,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: <Search className="h-5 w-5 text-brand-600" />,
      title: "Real-Time Link Detection",
      description:
        "Instantly recognizes platform URLs as you type or paste, matching known patterns across major platforms and direct web media.",
    },
    {
      icon: <Eye className="h-5 w-5 text-brand-600" />,
      title: "Media Previews",
      description:
        "Inspect thumbnail previews, duration timestamps, titles, and captions before committing to any download.",
    },
    {
      icon: <Sliders className="h-5 w-5 text-brand-600" />,
      title: "Clear Format & Size Specs",
      description:
        "Know exactly what you are saving: transparent file size indicators, accurate extensions, and verified MIME types.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
      title: "Hardened SSRF Protection",
      description:
        "Strict multi-hop server-side validation blocks access to private subnets, loopbacks, internal DNS, and cloud metadata endpoints.",
    },
    {
      icon: <Smartphone className="h-5 w-5 text-brand-600" />,
      title: "Mobile-First Design",
      description:
        "A lightweight, fully responsive experience crafted for mobile phones, tablets, and desktop workstations alike.",
    },
    {
      icon: <Info className="h-5 w-5 text-blue-600" />,
      title: "Transparent Error Guidance",
      description:
        "No cryptic 500 errors or fake download buttons. When an operation requires API keys or creator authorization, we explain exactly why.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white border-t border-surface-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
            Why Choose Downloadie
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Security, Speed, and Honesty
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Every feature is backed by real implementation. Zero misleading claims, zero deceptive redirects, and zero spam popups.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-surface-border bg-slate-50/50 hover:bg-white hover:shadow-card hover:border-brand-200 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center shadow-2xs mb-4">
                {feat.icon}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1.5">
                {feat.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
