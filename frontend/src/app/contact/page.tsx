import React from "react";
import { Metadata } from "next";
import { Mail, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & DMCA Takedown Policy — Downloadie",
  description:
    "Contact Downloadie regarding copyright notices, DMCA takedown procedures, and general inquiries.",
};

export default function ContactPage() {
  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-800 text-xs font-semibold mb-3">
            <Mail className="h-3.5 w-3.5 text-brand-600" />
            <span>Support &amp; Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Contact &amp; DMCA Takedown Notice
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Procedures for submitting copyright concerns or technical questions.
          </p>
        </div>

        {/* DMCA Policy Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-50 border border-surface-border space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900">
            <FileText className="h-5 w-5 text-brand-600" />
            <h2>Digital Millennium Copyright Act (DMCA) Policy</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Downloadie respects the intellectual property rights of creators and copyright holders. Because Downloadie is a transient client-side inspection tool and does not maintain a permanent media hosting repository, we do not host user files permanently.
          </p>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            If you are a copyright owner or an authorized agent and believe that a specific URL or automated integration on Downloadie violates your intellectual property, you may request that specific domain or URL patterns be permanently blacklisted by providing:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 pl-2">
            <li>Identification of the copyrighted work claimed to have been infringed.</li>
            <li>Identification of the specific media URL or material to be blocked.</li>
            <li>Your contact information (name, email address, or representative authorization).</li>
            <li>A statement made in good faith that the disputed use is not authorized by the copyright owner.</li>
            <li>A statement made under penalty of perjury that the information in your notice is accurate.</li>
          </ul>
        </div>

        {/* Contact Submission Box */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border-2 border-surface-border space-y-4">
          <h2 className="text-lg font-bold text-slate-900">
            Submit an Inquiry or Takedown Notice
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Please submit all formal notices and developer integration questions directly to our compliance inbox:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono text-slate-800">
            Email: <span className="font-semibold text-brand-600">contact@downloadie.app</span>
          </div>
          <p className="text-xs text-slate-500 italic">
            Valid DMCA notices with the required statutory elements will be processed promptly to restrict or blacklist infringing endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}
