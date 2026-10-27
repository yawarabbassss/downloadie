import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export function Logo({ className = "", size = 36, showWordmark = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* SVG Brand Mark */}
      <div
        className="relative flex items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105 overflow-hidden flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="logo-tray-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e0e7ff" />
            </linearGradient>
          </defs>

          {/* Squircle Background */}
          <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#logo-bg-grad)" />
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="13"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />

          {/* Stream Base Tray */}
          <path
            d="M14 33C14 34.657 15.343 36 17 36H31C32.657 36 34 34.657 34 33"
            stroke="url(#logo-tray-grad)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Stream Arrow */}
          <path
            d="M24 12V28M24 28L18 22M24 28L30 22"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Spark Accent Dot */}
          <circle cx="34" cy="14" r="2.5" fill="#38bdf8" />
        </svg>
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
            Downloadie
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-0.5">
            Media Downloader
          </span>
        </div>
      )}
    </div>
  );
}
