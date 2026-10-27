import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-slate-50/70 py-12 text-slate-600 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="group inline-flex items-center">
              <Logo size={32} />
            </Link>
            <p className="text-xs leading-relaxed text-slate-500">
              A modern, privacy-focused media inspection and downloading tool built with clean architecture and strict security controls.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span>Zero session harvesting</span>
            </div>
          </div>

          {/* Supported Platforms */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Platforms
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/platforms/instagram" className="hover:text-brand-600 transition-colors">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="/platforms/youtube" className="hover:text-brand-600 transition-colors">
                  YouTube
                </Link>
              </li>
              <li>
                <Link href="/platforms/tiktok" className="hover:text-brand-600 transition-colors">
                  TikTok
                </Link>
              </li>
              <li>
                <Link href="/platforms/facebook" className="hover:text-brand-600 transition-colors">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="/platforms/direct" className="hover:text-brand-600 transition-colors">
                  Direct Media
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation & Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-brand-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/platforms" className="hover:text-brand-600 transition-colors">
                  Platform Status
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-brand-600 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 transition-colors">
                  Contact & DMCA
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Legal & Privacy
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:text-brand-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-600 transition-colors">
                  Content Rights & Takedown
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 text-xs text-slate-500 space-y-3">
          <p className="leading-relaxed">
            <strong>Content Rights Disclaimer:</strong> Downloadie is an independent media retrieval utility. Downloadie does not host, duplicate, or claim ownership of third-party media. All trademarks, logos, and service marks (including Instagram, YouTube, TikTok, Facebook, and Meta) belong to their respective owners. Users must strictly ensure they own or hold explicit authorization before saving or distributing any media.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60 pt-4">
            <p>&copy; {new Date().getFullYear()} Downloadie. All rights reserved.</p>
            <p className="text-slate-400">Built for security, transparency, and lawful media workflows.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
