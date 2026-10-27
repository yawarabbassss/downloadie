"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Clock,
  HardDrive,
  FileVideo,
  FileImage,
  FileAudio,
  Layers,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { MediaResolutionResult, MediaFormatOption } from "@/lib/types";
import { createDownload, pollJobStatus } from "@/lib/api";
import { formatBytes, formatSeconds } from "@/lib/utils";

interface MediaResultCardProps {
  result: MediaResolutionResult;
  onReset: () => void;
}

export function MediaResultCard({ result, onReset }: MediaResultCardProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>(
    result.formats.length > 0 ? result.formats[0].format_id : "original"
  );
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadReadyUrl, setDownloadReadyUrl] = useState<string | null>(null);

  const activeFormat: MediaFormatOption | undefined = result.formats.find(
    (f) => f.format_id === selectedFormat
  ) || result.formats[0];

  const handleStartDownload = async (itemIndex?: number) => {
    setDownloading(true);
    setDownloadProgress(5);
    setDownloadError(null);
    setDownloadReadyUrl(null);

    try {
      const job = await createDownload(result.url, selectedFormat, itemIndex);
      if (job.status === "failed") {
        setDownloadError(job.error_message || "Failed to initiate download job.");
        setDownloading(false);
        return;
      }

      // If job is already ready (e.g. instant direct stream)
      if (job.status === "ready" && job.download_url) {
        setDownloadProgress(100);
        setDownloadReadyUrl(job.download_url);
        window.location.href = job.download_url;
        setDownloading(false);
        return;
      }

      // Poll for job completion
      const pollInterval = setInterval(async () => {
        try {
          const currentJob = await pollJobStatus(job.job_id);
          setDownloadProgress(currentJob.progress_percent || 50);

          if (currentJob.status === "ready" && currentJob.download_url) {
            clearInterval(pollInterval);
            setDownloadProgress(100);
            setDownloadReadyUrl(currentJob.download_url);
            window.location.href = currentJob.download_url;
            setDownloading(false);
          } else if (currentJob.status === "failed" || currentJob.status === "expired") {
            clearInterval(pollInterval);
            setDownloadError(currentJob.error_message || "Download processing failed.");
            setDownloading(false);
          }
        } catch (err: any) {
          clearInterval(pollInterval);
          setDownloadError(err.message || "Network polling error.");
          setDownloading(false);
        }
      }, 1000);
    } catch (err: any) {
      setDownloadError(err.message || "Failed to start download.");
      setDownloading(false);
    }
  };

  const getMediaTypeBadge = () => {
    switch (result.media_type) {
      case "video":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <FileVideo className="h-3 w-3" /> Video
          </span>
        );
      case "image":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileImage className="h-3 w-3" /> Image
          </span>
        );
      case "audio":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <FileAudio className="h-3 w-3" /> Audio
          </span>
        );
      case "carousel":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Layers className="h-3 w-3" /> Carousel Post
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            Media
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 bg-white rounded-2xl border border-surface-border shadow-lifted overflow-hidden transition-all animate-in fade-in slide-in-from-bottom-2">
      {/* Top Banner with Provider & Type */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50/80 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <span className="font-bold text-sm text-slate-900 tracking-tight">
            {result.provider_name}
          </span>
          {getMediaTypeBadge()}
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Inspect another link</span>
        </button>
      </div>

      <div className="p-6">
        {/* If Media Can Be Downloaded */}
        {result.can_download ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Thumbnail or Icon */}
              <div className="relative w-full sm:w-48 h-40 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {result.thumbnail_url ? (
                  <img
                    src={result.thumbnail_url}
                    alt={result.title || "Media preview"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileVideo className="h-12 w-12 text-slate-400" />
                )}
                {result.duration_seconds && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-white text-[11px] font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatSeconds(result.duration_seconds)}</span>
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2">
                  {result.title || "Ready to Download"}
                </h3>
                {result.caption && (
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {result.caption}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  {activeFormat?.file_size_bytes && (
                    <span className="inline-flex items-center gap-1">
                      <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                      {formatBytes(activeFormat.file_size_bytes)}
                    </span>
                  )}
                  {activeFormat?.mime_type && (
                    <span className="inline-flex items-center gap-1">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {activeFormat.extension}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Format Selection (if multiple options) */}
            {result.formats.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Select Format / Quality:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.formats.map((fmt) => (
                    <button
                      key={fmt.format_id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.format_id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs text-left transition-all ${
                        selectedFormat === fmt.format_id
                          ? "border-brand-600 bg-brand-50 text-brand-900 ring-1 ring-brand-600"
                          : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      <span className="font-medium">{fmt.label}</span>
                      <span className="text-slate-500 font-mono">
                        {fmt.file_size_bytes ? formatBytes(fmt.file_size_bytes) : fmt.extension}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Download Action & Progress */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              {downloading ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-600" />
                      Processing media stream...
                    </span>
                    <span className="font-mono font-semibold">{downloadProgress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              ) : downloadReadyUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>Download ready! Your browser should begin saving the file shortly.</span>
                  </div>
                  <a
                    href={downloadReadyUrl}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Click here if download did not start</span>
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleStartDownload()}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm sm:text-base shadow-sm hover:shadow transition-all focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <Download className="h-5 w-5" />
                  <span>Download Media File</span>
                </button>
              )}

              {downloadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{downloadError}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Transparent Limitation / API Requirement State */
          <div className="space-y-5">
            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900">
              <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">
                  {result.status === "terms_restricted"
                    ? "Platform Policy Restriction"
                    : result.status === "requires_api_key"
                    ? "Developer Authorization Required"
                    : "Operation Unavailable"}
                </h4>
                <p className="text-xs leading-relaxed text-amber-800">
                  {result.notice_message}
                </p>
              </div>
            </div>

            {/* Official Platform Alternative */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-surface-border text-xs">
              <div className="text-slate-600">
                <span>Looking for the official creator workflow?</span>
              </div>
              {result.official_alternative_url && (
                <a
                  href={result.official_alternative_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-100 hover:text-brand-600 transition-colors shadow-2xs"
                >
                  <span>Open Official Platform</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
