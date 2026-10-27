import React from "react";
import { Metadata } from "next";
import { FaqSection } from "@/components/FaqSection";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Downloadie",
  description:
    "Find answers to common questions about Downloadie's supported media platforms, privacy policies, download limits, and troubleshooting.",
};

export default function FaqPage() {
  return (
    <div className="py-8 bg-slate-50/30">
      <FaqSection />
    </div>
  );
}
