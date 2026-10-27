"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, X, ShieldCheck } from "lucide-react";
import { Logo } from "./Logo";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-border bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo & Wordmark */}
        <Link href="/" className="group flex items-center">
          <Logo size={40} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Home
          </Link>
          <Link
            href="/instagram-analyzer"
            className="flex items-center gap-1.5 hover:text-brand-600 transition-colors font-medium text-slate-800"
          >
            <span>Instagram Analyzer</span>
            <span className="rounded-full bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
              New
            </span>
          </Link>
          <Link
            href="/instagram-carousel-downloader"
            className="hover:text-brand-600 transition-colors"
          >
            Carousel ZIP
          </Link>
          <Link href="/platforms" className="hover:text-brand-600 transition-colors">
            Platforms
          </Link>
          <Link href="/how-it-works" className="hover:text-brand-600 transition-colors">
            How It Works
          </Link>
          <Link href="/faq" className="hover:text-brand-600 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/platforms"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Honest Status</span>
          </Link>
          <a
            href="#url-input-section"
            className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            Check URL
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-border bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            href="/instagram-analyzer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-indigo-700 font-semibold bg-indigo-50/60"
          >
            📊 Instagram Profile Analyzer
          </Link>
          <Link
            href="/instagram-carousel-downloader"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            📦 One-Click Carousel Downloader
          </Link>
          <Link
            href="/platforms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Supported Platforms
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </Link>
          <Link
            href="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            FAQ
          </Link>
          <Link
            href="/privacy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Privacy Policy
          </Link>
          <div className="pt-2">
            <a
              href="#url-input-section"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              Check URL Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
