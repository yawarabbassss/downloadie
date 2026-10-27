"use client";

import React, { useState, useEffect } from "react";
import {
  Link as LinkIcon,
  Clipboard,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Instagram,
  Youtube,
  Globe,
  Video,
  Facebook,
} from "lucide-react";
import { detectProviderFromUrl } from "@/lib/utils";

interface UrlInputFormProps {
  onCheckUrl: (url: string) => Promise<void>;
  isLoading: boolean;
  initialUrl?: string;
}

export function UrlInputForm({ onCheckUrl, isLoading, initialUrl = "" }: UrlInputFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
    }
  }, [initialUrl]);

  const detection = detectProviderFromUrl(url);

  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setError(null);
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch (err) {
      // Clipboard access might be denied in some browsers; notify user
      setError("Clipboard access permission denied. Please paste manually (Ctrl+V).");
    }
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError("Please paste or type a media URL to inspect.");
      return;
    }

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      setError("URL must begin with http:// or https://");
      return;
    }

    try {
      new URL(cleanUrl);
    } catch {
      setError("Please enter a valid, well-formed web URL.");
      return;
    }

    setError(null);
    await onCheckUrl(cleanUrl);
  };

  const getProviderIcon = (iconName: string) => {
    switch (iconName) {
      case "Instagram":
        return <Instagram className="h-3.5 w-3.5 text-pink-600" />;
      case "Youtube":
        return <Youtube className="h-3.5 w-3.5 text-red-600" />;
      case "Video":
        return <Video className="h-3.5 w-3.5 text-cyan-600" />;
      case "Facebook":
        return <Facebook className="h-3.5 w-3.5 text-blue-600" />;
      case "FileVideo":
        return <FileVideo className="h-3.5 w-3.5 text-brand-600" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  return (
    <div id="url-input-section" className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl border-2 border-surface-border shadow-lifted hover:border-brand-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100 transition-all">
          {/* Main Input Field */}
          <div className="relative flex-1 flex items-center w-full pl-3 pr-2 py-1">
            <LinkIcon className="h-5 w-5 text-slate-400 mr-2.5 flex-shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleClear();
              }}
              placeholder="Paste your media link here... (Instagram, YouTube, TikTok, or direct MP4)"
              disabled={isLoading}
              className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
              aria-label="Media URL input"
            />

            {/* Quick Actions inside input */}
            <div className="flex items-center gap-1.5 ml-2">
              {url ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Clear link"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Paste from clipboard"
                >
                  <Clipboard className="h-3.5 w-3.5" />
                  <span>{pasteSuccess ? "Pasted!" : "Paste"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 flex-shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>Check Link</span>
            )}
          </button>
        </div>

        {/* Real-time detection badge */}
        {detection.label && (
          <div className="mt-2.5 flex items-center justify-between px-2 text-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 font-medium">
              {getProviderIcon(detection.iconName)}
              <span>{detection.label}</span>
            </div>
            <span className="text-slate-400 text-[11px]">Press Enter to check</span>
          </div>
        )}

        {/* Validation Error Message */}
        {error && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm animate-in fade-in">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
}
