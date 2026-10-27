"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Video,
} from "lucide-react";

import {
  createDownload,
  downloadInstagramCarousel,
  pollCarouselJobStatus,
  pollJobStatus,
  resolveInstagramCarousel,
} from "@/lib/api";
import { CarouselJobResponse, CarouselResolveResponse, CarouselSlideInfo } from "@/lib/types";

export default function InstagramCarouselDownloaderPage() {
  const [url, setUrl] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carouselData, setCarouselData] = useState<CarouselResolveResponse | null>(null);

  // ZIP Job state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipJob, setZipJob] = useState<CarouselJobResponse | null>(null);

  // Individual slide download jobs: slideIndex -> { status, progress, downloadUrl }
  const [itemJobs, setItemJobs] = useState<{ [key: number]: { status: string; progress: number; downloadUrl?: string } }>({});

  const handleResolve = async (customUrl?: string) => {
    const targetUrl = (customUrl || url).trim();
    if (!targetUrl) {
      setError("Please paste a valid Instagram carousel post URL.");
      return;
    }

    setIsResolving(true);
    setError(null);
    setZipJob(null);
    setZipProgress(0);

    try {
      const res = await resolveInstagramCarousel(targetUrl);
      setCarouselData(res);
      setUrl(targetUrl);
    } catch (err: any) {
      setError(err.message || "Failed to resolve Instagram carousel. Verify the post is public and eligible.");
    } finally {
      setIsResolving(false);
    }
  };

  const handleDownloadAllZip = async () => {
    if (!carouselData?.url) return;

    setIsZipping(true);
    setZipProgress(10);
    setError(null);

    try {
      const initialJob = await downloadInstagramCarousel(carouselData.url);
      setZipJob(initialJob);

      // Poll until ready or failed
      const pollInterval = setInterval(async () => {
        try {
          const status = await pollCarouselJobStatus(initialJob.job_id);
          setZipJob(status);
          setZipProgress(status.progress_percent || 10);

          if (status.status === "ready") {
            clearInterval(pollInterval);
            setIsZipping(false);
            if (status.download_url) {
              window.location.href = status.download_url;
            }
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            setIsZipping(false);
            setError(status.error_message || "Failed to assemble carousel ZIP archive.");
          }
        } catch (pollErr: any) {
          clearInterval(pollInterval);
          setIsZipping(false);
          setError("Error polling ZIP archive status.");
        }
      }, 1500);
    } catch (err: any) {
      setIsZipping(false);
      setError(err.message || "Could not initiate carousel ZIP download.");
    }
  };

  const handleDownloadSingleSlide = async (slide: CarouselSlideInfo) => {
    const idx = slide.slide_index;
    setItemJobs((prev) => ({ ...prev, [idx]: { status: "processing", progress: 20 } }));

    try {
      const job = await createDownload(carouselData?.url || url, "original", idx);
      
      const pollInterval = setInterval(async () => {
        try {
          const st = await pollJobStatus(job.job_id);
          setItemJobs((prev) => ({
            ...prev,
            [idx]: {
              status: st.status,
              progress: st.progress_percent || 50,
              downloadUrl: st.download_url || undefined,
            },
          }));

          if (st.status === "ready") {
            clearInterval(pollInterval);
            if (st.download_url) {
              window.location.href = st.download_url;
            }
          } else if (st.status === "failed") {
            clearInterval(pollInterval);
          }
        } catch {
          clearInterval(pollInterval);
        }
      }, 1500);
    } catch (err: any) {
      setItemJobs((prev) => ({ ...prev, [idx]: { status: "failed", progress: 0 } }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-surface-border py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/70 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
              <Archive className="h-3.5 w-3.5" />
              <span>One-Click Instagram Carousel & Album Downloader</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              One-Click Instagram Carousel Downloader
            </h1>
            <p className="mt-2.5 text-base text-slate-600 leading-relaxed">
              Detect every slide in an Instagram carousel post in original sequence. Download all images and videos
              bundled in a clean, numbered ZIP archive with a single click.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                <ShieldCheck className="h-3.5 w-3.5" /> Safe Sequence Numbering (slide-01, slide-02)
              </span>
              <span>•</span>
              <span>Preserves original image and MP4 quality</span>
              <span>•</span>
              <span>Zero session harvesting</span>
            </div>
          </div>

          {/* URL Input Form */}
          <div className="mt-8 max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleResolve();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste Instagram carousel link (e.g. https://www.instagram.com/p/...)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isResolving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60"
              >
                {isResolving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Detecting Slides...</span>
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4" />
                    <span>Detect Carousel</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Test Links */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Sample Post:</span>
              <button
                type="button"
                onClick={() => {
                  const testUrl = "https://www.instagram.com/reel/C5WTtLuPrkq/";
                  setUrl(testUrl);
                  handleResolve(testUrl);
                }}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 font-medium transition-colors border border-slate-200 truncate max-w-xs"
              >
                Sample Instagram Post (Reel/Media)
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3 text-rose-800 text-sm">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Carousel Detection Notice</p>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {carouselData && (
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
            {/* Header / Post Overview */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-4">
                {carouselData.thumbnail_url && (
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                    <img
                      src={carouselData.thumbnail_url}
                      alt={carouselData.title || "Post thumbnail"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {carouselData.title || "Instagram Post"}
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                      <Layers className="h-3 w-3" />
                      {carouselData.total_slides} {carouselData.total_slides === 1 ? "Slide" : "Slides"} Found
                    </span>
                  </div>

                  {carouselData.author && (
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">By {carouselData.author}</p>
                  )}

                  {carouselData.caption && (
                    <p className="text-xs text-slate-600 mt-1 max-w-2xl line-clamp-2 leading-relaxed">
                      {carouselData.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Download All Slides Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <a
                  href={carouselData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span>Original Post</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>

                <button
                  onClick={handleDownloadAllZip}
                  disabled={isZipping || !carouselData.can_download_all}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-700 transition-all disabled:opacity-60"
                >
                  {isZipping ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating ZIP ({zipProgress}%)...</span>
                    </>
                  ) : (
                    <>
                      <FileArchive className="h-4 w-4" />
                      <span>Download All Slides (ZIP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ZIP Progress Bar */}
            {isZipping && (
              <div className="mt-4 rounded-xl bg-indigo-50/70 border border-indigo-100 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-900">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                    Packaging slides into ZIP archive...
                  </span>
                  <span>{zipProgress}%</span>
                </div>
                <div className="w-full bg-indigo-200/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${zipProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-indigo-700">
                  Downloading items in sequential order, naming files slide-01, slide-02...
                </p>
              </div>
            )}

            {/* ZIP Ready Download Button */}
            {zipJob && zipJob.status === "ready" && zipJob.download_url && (
              <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-emerald-950">ZIP Archive Ready for Download!</p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {zipJob.archive_name} • {(zipJob.archive_size_bytes ? (zipJob.archive_size_bytes / (1024 * 1024)).toFixed(2) : "Unknown")} MB
                    </p>
                  </div>
                </div>

                <a
                  href={zipJob.download_url}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download ZIP Again</span>
                </a>
              </div>
            )}

            {/* Individual Slides Gallery Grid */}
            <div className="mt-8">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                Individual Slides ({carouselData.slides.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {carouselData.slides.map((slide) => {
                  const slideState = itemJobs[slide.slide_index];
                  return (
                    <div
                      key={slide.slide_index}
                      className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm"
                    >
                      {/* Thumbnail Preview */}
                      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                        {slide.thumbnail_url ? (
                          <img
                            src={slide.thumbnail_url}
                            alt={`Slide ${slide.slide_index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            {slide.media_type === "video" ? (
                              <Video className="h-8 w-8" />
                            ) : (
                              <ImageIcon className="h-8 w-8" />
                            )}
                          </div>
                        )}

                        {/* Sequence badge */}
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 rounded-md bg-black/75 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-white">
                            Slide {slide.slide_index + 1}
                          </span>
                        </div>

                        {/* Format badge */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                            {slide.media_type === "video" ? "MP4 Video" : "High-Res JPG"}
                          </span>
                        </div>
                      </div>

                      {/* Card Details & Download Action */}
                      <div className="p-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
                        <div>
                          <p className="text-xs font-semibold text-slate-800">slide-{(slide.slide_index + 1).toString().padStart(2, "0")}{slide.extension}</p>
                          <p className="text-[10px] text-slate-500">
                            {slide.media_type === "video" ? "Video container" : "JPEG Image"}
                          </p>
                        </div>

                        {slideState?.status === "ready" && slideState.downloadUrl ? (
                          <a
                            href={slideState.downloadUrl}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Saved</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => handleDownloadSingleSlide(slide)}
                            disabled={slideState?.status === "processing"}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors disabled:opacity-60"
                          >
                            {slideState?.status === "processing" ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span>{slideState.progress}%</span>
                              </>
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5" />
                                <span>Download</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
