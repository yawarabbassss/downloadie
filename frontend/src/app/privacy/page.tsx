import React from "react";
import { Metadata } from "next";
import { ShieldCheck, Lock, EyeOff, Trash2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Downloadie",
  description:
    "Learn how Downloadie safeguards your privacy with zero password collection, ephemeral media retention, and no invasive tracking.",
};

export default function PrivacyPage() {
  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Privacy-First Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: October 2026
          </p>
        </div>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-50 border border-surface-border space-y-2">
            <Lock className="h-5 w-5 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">Zero Password Policy</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never ask for your social media credentials, passwords, or personal login cookies.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-surface-border space-y-2">
            <Trash2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Ephemeral Storage</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Downloaded media is processed temporarily and automatically deleted within 60 minutes.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-surface-border space-y-2">
            <EyeOff className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">No Invasive Tracking</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We do not build user tracking profiles or sell browsing telemetry to third parties.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Information We Collect</h2>
            <p>
              Downloadie is designed to be used without mandatory account registration. When you submit a media URL for inspection, our servers receive:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>The submitted media link or URL.</li>
              <li>Standard technical request metadata (such as IP address, browser User-Agent, and timestamp) solely for rate limiting and server health monitoring.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. How We Handle Media Files</h2>
            <p>
              When an eligible direct media link is downloaded, files are temporarily stored in an isolated, secure directory. Download links are protected using time-limited cryptographic HMAC signatures. Once a job expires (maximum 60 minutes), our automated garbage collection permanently unlinks and deletes the file from our storage disk.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Prohibition on Credential Harvesting</h2>
            <p>
              Downloadie strictly rejects password harvesting, cookie scraping, session hijacking, and private-account cracking. We will never prompt you to enter credentials for Meta, Instagram, YouTube, TikTok, Google, or any other third-party platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Third-Party Links &amp; APIs</h2>
            <p>
              Our application may interface with or reference external APIs provided by platforms such as Google, Meta, or TikTok. Interacting with external platforms is subject to their respective privacy terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">5. Updates to This Policy</h2>
            <p>
              We may revise this privacy statement periodically to reflect changes in our platform adapters or relevant legal obligations. Revisions take effect immediately upon posting to this page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
