"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Info,
  Layers,
  Lock,
  MessageCircle,
  RefreshCw,
  Search,
  Share2,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Video,
} from "lucide-react";

import {
  analyzeInstagramProfile,
  disconnectInstagramAccount,
  fetchProfileGrowth,
  getConnectedInstagramAccount,
  startInstagramAuth,
} from "@/lib/api";
import {
  InstagramAnalysisResponse,
  InstagramConnectedAccountInfo,
  InstagramGrowthAnalytics,
  InstagramMediaItem,
} from "@/lib/types";

export default function InstagramAnalyzerPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InstagramAnalysisResponse | null>(null);

  // Growth date-range filter
  const [growthDays, setGrowthDays] = useState<number>(30);
  const [growthData, setGrowthData] = useState<InstagramGrowthAnalytics | null>(null);
  const [growthLoading, setGrowthLoading] = useState(false);

  // Content tab & sorting
  const [activeTab, setActiveTab] = useState<"all" | "post" | "reel" | "carousel">("all");
  const [sortBy, setSortBy] = useState<"likes" | "comments" | "views" | "engagement" | "newest">("likes");

  // Connected account state
  const [connectedAccount, setConnectedAccount] = useState<InstagramConnectedAccountInfo>({ is_connected: false });
  const [authInstructions, setAuthInstructions] = useState<string | null>(null);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);

  useEffect(() => {
    // Check if user has an authorized connected account
    getConnectedInstagramAccount().then(setConnectedAccount).catch(() => {});

    // Automatically load sample profile for immediate demonstration
    handleAnalyze("demo_creator");
  }, []);

  const handleAnalyze = async (targetQuery?: string, forceRefresh = false) => {
    const q = (targetQuery || query).trim();
    if (!q) {
      setError("Please enter an Instagram username or profile link.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeInstagramProfile(q, forceRefresh);
      setData(result);
      setGrowthData(result.growth);
      setQuery(result.profile.username);
    } catch (err: any) {
      setError(err.message || "Failed to analyze Instagram profile. Please check the username.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDaysChange = async (days: number) => {
    setGrowthDays(days);
    if (!data?.profile?.username) return;

    setGrowthLoading(true);
    try {
      const g = await fetchProfileGrowth(data.profile.username, days);
      setGrowthData(g);
    } catch {
      // Fallback to existing
    } finally {
      setGrowthLoading(false);
    }
  };

  const handleConnectAuth = async () => {
    try {
      const res = await startInstagramAuth();
      if (res.is_configured && res.auth_url) {
        window.location.href = res.auth_url;
      } else {
        setAuthInstructions(
          res.setup_instructions ||
            "Meta Developer App credentials are not configured in backend environment variables (.env)."
        );
      }
    } catch (err: any) {
      setAuthInstructions("Unable to initiate Meta OAuth. Check server configuration.");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectInstagramAccount();
      setConnectedAccount({ is_connected: false });
      if (data?.profile?.username) {
        handleAnalyze(data.profile.username, true);
      }
    } catch (err: any) {
      alert("Failed to disconnect: " + err.message);
    }
  };

  // Filter and sort media items
  const filteredMedia = (data?.media || [])
    .filter((item) => {
      if (activeTab === "all") return true;
      if (activeTab === "post") return item.media_type === "IMAGE";
      if (activeTab === "reel") return item.media_type === "VIDEO";
      if (activeTab === "carousel") return item.media_type === "CAROUSEL";
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "likes") return (b.likes || 0) - (a.likes || 0);
      if (sortBy === "comments") return (b.comments || 0) - (a.comments || 0);
      if (sortBy === "views") return (b.views || 0) - (a.views || 0);
      if (sortBy === "engagement") return (b.engagement_rate || 0) - (a.engagement_rate || 0);
      if (sortBy === "newest") {
        return new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime();
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-surface-border py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200/70 px-3 py-1 text-xs font-semibold text-indigo-700 mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Transparent Instagram Analytics & Historical Snapshots</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Instagram Profile Analyzer
            </h1>
            <p className="mt-2.5 text-base text-slate-600 leading-relaxed">
              Inspect engagement rates, historical follower growth trends, and top-performing posts with complete
              mathematical transparency.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                <Shield className="h-3.5 w-3.5" /> Zero Password Harvesting
              </span>
              <span>•</span>
              <span>Public heuristics + official Meta Graph API</span>
              <span>•</span>
              <span>Database-backed snapshot system</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="mt-8 max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAnalyze();
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter username (e.g. cristiano, natgeo) or profile URL..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    <span>Analyze Profile</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-600">Quick Test:</span>
              {[
                { label: "Alex Rivera (Demo Creator)", user: "demo_creator" },
                { label: "@natgeo", user: "natgeo" },
                { label: "@nasa", user: "nasa" },
                { label: "@travel_stories", user: "travel_stories" },
              ].map((chip) => (
                <button
                  key={chip.user}
                  type="button"
                  onClick={() => {
                    setQuery(chip.user);
                    handleAnalyze(chip.user);
                  }}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 font-medium transition-colors border border-slate-200"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-3 text-rose-800 text-sm">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Analysis Notice</p>
                  <p className="text-xs text-rose-700 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Connected Instagram Account Banner */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="rounded-xl bg-indigo-600 text-white p-2.5 shadow-sm">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900">
                    Official Instagram Professional Account Integration
                  </h3>
                  {connectedAccount.is_connected && (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      Connected: @{connectedAccount.username}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Connect your Instagram Creator or Business account via Meta OAuth to access verified private insights
                  including unique account reach, total impressions, saves, and shares.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {connectedAccount.is_connected ? (
                <button
                  onClick={handleDisconnect}
                  className="w-full sm:w-auto text-xs font-semibold text-rose-700 hover:text-rose-800 bg-white border border-rose-200 px-3.5 py-2 rounded-xl transition-colors"
                >
                  Disconnect Account
                </button>
              ) : (
                <button
                  onClick={handleConnectAuth}
                  className="w-full sm:w-auto text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm transition-colors inline-flex items-center justify-center gap-1.5"
                >
                  <span>Connect with Instagram</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {authInstructions && (
            <div className="mt-4 rounded-xl bg-white border border-slate-200 p-3.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
                <Info className="h-4 w-4 text-indigo-600" />
                <span>Meta Developer App Setup Instructions</span>
              </div>
              <p className="text-slate-600">{authInstructions}</p>
              <div className="mt-2 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-200">
                Required .env settings: INSTAGRAM_APP_ID=your_app_id, INSTAGRAM_APP_SECRET=your_app_secret
              </div>
            </div>
          )}
        </div>

        {/* Profile Overview Card */}
        {data && (
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-100 bg-slate-100 shrink-0">
                  {data.profile.profile_picture_url ? (
                    <img
                      src={data.profile.profile_picture_url}
                      alt={data.profile.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 font-bold text-xl">
                      {data.profile.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-slate-900">
                      {data.profile.display_name || data.profile.username}
                    </h2>
                    {data.profile.is_verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-xs font-semibold">
                        <CheckCircle2 className="h-3 w-3 text-blue-600" />
                        Verified
                      </span>
                    )}
                    <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-0.5 text-xs font-medium border border-slate-200">
                      {data.profile.account_type || "Public Profile"}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-500 mt-0.5">@{data.profile.username}</p>
                  {data.profile.biography && (
                    <p className="text-xs text-slate-600 mt-2 max-w-xl line-clamp-2 leading-relaxed">
                      {data.profile.biography}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <a
                  href={data.profile.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <span>Instagram Profile</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
                <button
                  onClick={() => handleAnalyze(data.profile.username, true)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Refresh Data</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
              <div className="rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Followers</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {data.performance.follower_count.formatted_value}
                </p>
                <span className="text-[10px] text-slate-400">Public profile metric</span>
              </div>
              <div className="rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Following</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {data.performance.following_count.formatted_value}
                </p>
                <span className="text-[10px] text-slate-400">Public count</span>
              </div>
              <div className="rounded-xl bg-slate-50/70 p-3.5 border border-slate-100">
                <span className="text-xs text-slate-500 font-medium">Published Media</span>
                <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {data.performance.media_count.formatted_value}
                </p>
                <span className="text-[10px] text-slate-400">Posts & Reels</span>
              </div>
              <div className="rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-700 font-semibold">Engagement Rate</span>
                  <button
                    onClick={() => setFormulaModalOpen(!formulaModalOpen)}
                    className="text-indigo-600 hover:text-indigo-800"
                    title="View mathematical formula"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-xl font-extrabold text-indigo-900 mt-0.5">
                  {data.performance.public_engagement_rate.formatted_value}
                </p>
                <span className="text-[10px] text-indigo-600">Public estimate</span>
              </div>
            </div>

            {/* Formula Explanation Popover */}
            {formulaModalOpen && (
              <div className="mt-4 rounded-xl bg-indigo-900 text-white p-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <span>Engagement Rate Formula</span>
                  <button onClick={() => setFormulaModalOpen(false)} className="text-slate-300 hover:text-white">
                    ✕
                  </button>
                </div>
                <div className="font-mono bg-indigo-950 p-2.5 rounded text-indigo-200">
                  {data.performance.public_engagement_rate.formula ||
                    "((avg_likes + avg_comments) / follower_count) * 100"}
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  This calculation represents a public visible estimate derived by dividing recent interactions (likes
                  and comments) by current follower count. This is distinct from private reach-based analytics.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Authorized Creator Insights vs Public Estimates */}
        {data && (
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Performance Dashboard</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifiable metrics distinguished between public feeds and authorized account insights.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 px-2 py-1 font-medium">
                  Public Estimate
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 text-indigo-800 px-2 py-1 font-semibold">
                  <Lock className="h-3 w-3" /> Meta Authorized
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-xs text-slate-500 font-medium">Avg. Likes per Post</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {data.performance.avg_likes.formatted_value}
                </p>
                <span className="text-[10px] text-slate-400">Calculated from recent media</span>
              </div>
              <div className="rounded-xl border border-slate-200 p-4">
                <span className="text-xs text-slate-500 font-medium">Avg. Comments per Post</span>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {data.performance.avg_comments.formatted_value}
                </p>
                <span className="text-[10px] text-slate-400">Calculated from recent media</span>
              </div>

              {/* Authorized Insights */}
              {data.performance.verified_reach ? (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                  <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold">
                    <span>Unique Reach</span>
                    <span className="rounded bg-indigo-200/60 px-1 py-0.5 text-[9px]">Verified</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-950 mt-1">
                    {data.performance.verified_reach.formatted_value}
                  </p>
                  <span className="text-[10px] text-indigo-600">Unique accounts reached</span>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-center">
                  <span className="text-xs text-slate-400 font-medium">Unique Reach</span>
                  <p className="text-sm font-semibold text-slate-400 mt-1">Requires Auth</p>
                  <span className="text-[10px] text-slate-400">Connect Instagram account</span>
                </div>
              )}

              {data.performance.verified_saves ? (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
                  <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold">
                    <span>Content Saves</span>
                    <span className="rounded bg-indigo-200/60 px-1 py-0.5 text-[9px]">Verified</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-950 mt-1">
                    {data.performance.verified_saves.formatted_value}
                  </p>
                  <span className="text-[10px] text-indigo-600">Private creator insight</span>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 flex flex-col justify-center">
                  <span className="text-xs text-slate-400 font-medium">Content Saves</span>
                  <p className="text-sm font-semibold text-slate-400 mt-1">Requires Auth</p>
                  <span className="text-[10px] text-slate-400">Private creator metric</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historical Follower Growth Analytics */}
        {growthData && (
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">Follower Growth Analytics</h3>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                    Database Snapshots
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{growthData.date_range_label}</p>
              </div>

              {/* Date range filters */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDaysChange(d)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      growthDays === d
                        ? "bg-white text-slate-900 shadow-sm font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Growth Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-xs text-slate-500">Starting Followers</span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {growthData.starting_followers.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">At start of period</span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-xs text-slate-500">Net Follower Change</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {growthData.net_follower_change >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-rose-600" />
                  )}
                  <p
                    className={`text-lg font-bold ${
                      growthData.net_follower_change >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {growthData.net_follower_change > 0 ? "+" : ""}
                    {growthData.net_follower_change.toLocaleString()}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400">Net followers gained</span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-xs text-slate-500">Growth Rate</span>
                <p
                  className={`text-lg font-bold mt-0.5 ${
                    growthData.percentage_growth >= 0 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {growthData.percentage_growth > 0 ? "+" : ""}
                  {growthData.percentage_growth}%
                </p>
                <span className="text-[10px] text-slate-400">
                  ((ending - starting) / starting) * 100
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-xs text-slate-500">Daily Average Net Change</span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">
                  {growthData.daily_average_net_change > 0 ? "+" : ""}
                  {growthData.daily_average_net_change.toLocaleString()}/day
                </p>
                <span className="text-[10px] text-slate-400">Average per day</span>
              </div>
            </div>

            {/* Growth Visual Chart */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>Follower Growth Timeline</span>
                <span>{growthData.snapshot_count} recorded snapshots</span>
              </div>

              {growthData.history_points.length > 1 ? (
                <div className="space-y-3">
                  <div className="h-40 w-full flex items-end gap-2 pt-4 pb-1 px-2 border-b border-slate-200">
                    {(() => {
                      const points = growthData.history_points;
                      const minF = Math.min(...points.map((p) => p.follower_count));
                      const maxF = Math.max(...points.map((p) => p.follower_count));
                      const range = maxF - minF || 1;

                      return points.map((pt, idx) => {
                        const heightPct = Math.max(12, Math.round(((pt.follower_count - minF) / range) * 85));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                            {/* Hover tooltip */}
                            <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded px-2 py-1 pointer-events-none whitespace-nowrap z-10 shadow">
                              {pt.date}: {pt.follower_count.toLocaleString()} (
                              {pt.daily_net_change && pt.daily_net_change > 0 ? "+" : ""}
                              {pt.daily_net_change || 0})
                            </div>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full rounded-t bg-indigo-600 hover:bg-indigo-500 transition-all cursor-pointer"
                            />
                            <span className="text-[9px] text-slate-400 mt-1 truncate max-w-[40px]">{pt.date}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  <Calendar className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">First Snapshot Recorded Today</p>
                  <p className="text-slate-500 mt-0.5 max-w-md mx-auto">
                    Historical tracking has commenced. As Downloadie checks this profile over time, daily growth trends
                    and net follower changes will populate this timeline.
                  </p>
                </div>
              )}

              <p className="text-[11px] text-slate-500 mt-4 leading-relaxed">
                <span className="font-semibold text-slate-700">Transparency Notice:</span> {growthData.notice}
              </p>
            </div>
          </div>
        )}

        {/* Top-Performing Posts and Reels */}
        {data && (
          <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent & Top-Performing Content</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top posts ranked by visible engagement metrics. Not claimed as private reach.
                </p>
              </div>

              {/* Filters and Sorting */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Content type tabs */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                  {(
                    [
                      { id: "all", label: "All Content" },
                      { id: "post", label: "Photos" },
                      { id: "reel", label: "Reels" },
                      { id: "carousel", label: "Carousels" },
                    ] as const
                  ).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === t.id
                          ? "bg-white text-slate-900 shadow-sm font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Sort selector */}
                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm outline-none"
                >
                  <option value="likes">Sort by: Most Likes</option>
                  <option value="comments">Sort by: Most Comments</option>
                  <option value="views">Sort by: Most Views</option>
                  <option value="engagement">Sort by: Highest Engagement</option>
                  <option value="newest">Sort by: Newest</option>
                </select>
              </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
              {filteredMedia.length > 0 ? (
                filteredMedia.map((media) => (
                  <div
                    key={media.id}
                    className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow transition-all"
                  >
                    {/* Media Thumbnail */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      {media.thumbnail_url ? (
                        <img
                          src={media.thumbnail_url}
                          alt={media.caption || "Instagram media"}
                          className="h-full w-full object-cover transition-transform hover:scale-105 duration-300"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Video className="h-8 w-8" />
                        </div>
                      )}

                      {/* Content-type badge */}
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-black/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                          {media.media_type === "CAROUSEL" && (
                            <>
                              <Layers className="h-3 w-3" />
                              <span>{media.carousel_slide_count || "Multi"} Slides</span>
                            </>
                          )}
                          {media.media_type === "VIDEO" && (
                            <>
                              <Video className="h-3 w-3" />
                              <span>Reel</span>
                            </>
                          )}
                          {media.media_type === "IMAGE" && <span>Photo</span>}
                        </span>
                      </div>

                      {/* Engagement Rate Badge */}
                      {media.engagement_rate && (
                        <div className="absolute top-3 right-3">
                          <span className="rounded-md bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white">
                            {media.engagement_rate}% ER
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Caption & Metrics */}
                    <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                        {media.caption || "No caption provided."}
                      </p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            ❤️ {media.likes?.toLocaleString() || "0"}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-700">
                            💬 {media.comments?.toLocaleString() || "0"}
                          </span>
                        </div>
                        <a
                          href={media.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1"
                        >
                          <span>View</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400 text-sm">
                  No media items match the selected filter.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
