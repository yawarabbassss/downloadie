"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How do I use Downloadie to save media?",
    answer:
      "Simply copy the URL of the media file or supported post from your browser or mobile app, paste it into the URL input on our homepage, and click 'Check Link'. Downloadie will inspect the link, detect the provider, verify the file's security and MIME type, and present available download options.",
  },
  {
    question: "Which platforms and file formats are supported?",
    answer:
      "Downloadie provides out-of-the-box support for direct media links (.mp4, .webm, .mov, .mp3, .wav, .jpg, .png, .webp). For platforms like Instagram, YouTube, TikTok, and Facebook, Downloadie features dedicated adapters that interface with official developer APIs (e.g. Meta Graph API, YouTube Data API) where configured. Operations requiring credentials or creator approval will explicitly outline those requirements rather than faking downloads.",
  },
  {
    question: "Why do some links report that downloading is restricted or unavailable?",
    answer:
      "Downloadie adheres strictly to platform policies and legal copyright standards. For example, YouTube's Terms of Service restrict direct third-party stream ripping, so we provide an official link to YouTube Studio for creators. Similarly, Instagram posts and stories from private profiles cannot be retrieved without explicit user authentication.",
  },
  {
    question: "Can I download private or password-protected content?",
    answer:
      "No. Downloadie will never circumvent access controls, harvest user session cookies, crack passwords, or bypass authentication walls. If content is private, only authorized viewers on the official platform can view it.",
  },
  {
    question: "What quality and formats are available for downloaded files?",
    answer:
      "For direct media files, Downloadie delivers the original quality file provided by the host server up to our maximum 150 MB safety ceiling. Available file extensions include MP4 and WEBM for video, MP3 and WAV for audio, and JPG, PNG, and WEBP for images.",
  },
  {
    question: "What are my legal responsibilities regarding content ownership?",
    answer:
      "You must only download media that you personally own, create, or have explicit written permission from the copyright owner to save. Downloadie is an inspection utility and does not grant copyright licenses for third-party intellectual property.",
  },
  {
    question: "How does Downloadie protect user privacy and handle temporary files?",
    answer:
      "Downloadie operates under a strict privacy-first policy. We do not require account registration, do not log personal browsing tokens, and do not track users across the web. Ephemeral media files processed for downloading are automatically deleted after 60 minutes.",
  },
  {
    question: "How can I troubleshoot a failed download or timeout?",
    answer:
      "Ensure the submitted URL is publicly accessible and starts with https:// or http://. Double check that the file is not behind a CAPTCHA or Cloudflare Turnstile wall, and that the file size is under 150 MB. If the issue persists, verify that the remote host is responsive.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-50/50 border-t border-surface-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-600 mb-2">
            Answers &amp; Transparency
          </h2>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h3>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Everything you need to know about Downloadie, supported platforms, and our security policies.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-surface-border bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-900 hover:text-brand-600 focus:outline-none transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-brand-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-3 animate-in fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
