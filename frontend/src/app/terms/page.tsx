import React from "react";
import { Metadata } from "next";
import { Scale, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — Downloadie",
  description:
    "Read Downloadie's Terms of Service governing lawful usage, content ownership, intellectual property rights, and user responsibilities.",
};

export default function TermsPage() {
  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-3">
            <Scale className="h-3.5 w-3.5 text-brand-600" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last Updated: October 2026
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3.5">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong>Important Content Rights Notice:</strong> Downloadie is provided as an inspection and downloading utility for content that you own, have created, or possess explicit legal authorization to store. You are strictly responsible for complying with all applicable copyright and intellectual property laws.
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Downloadie, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to all terms, you must discontinue using Downloadie immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Lawful and Permitted Use</h2>
            <p>
              You agree that you will not use Downloadie to:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Download copyrighted materials without the express authorization of the copyright holder.</li>
              <li>Circumvent digital rights management (DRM), access controls, or platform paywalls.</li>
              <li>Perform denial of service attacks, excessive automated scraping, or bypass rate limits.</li>
              <li>Scan internal private subnets, cloud metadata addresses, or internal services (SSRF attempts are logged and blocked).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Independent Status &amp; Trademarks</h2>
            <p>
              Downloadie is an independent product and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta, YouTube, Google, TikTok, ByteDance, or any of their subsidiaries or affiliates. All product and company names are trademarks or registered trademarks of their respective holders.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Disclaimer of Warranties</h2>
            <p>
              Downloadie is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, whether express or implied. We do not guarantee uninterrupted availability, error-free operation, or universal compatibility with all third-party media hosts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Downloadie and its operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use or inability to use the service, or any unauthorized access to your media files.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
