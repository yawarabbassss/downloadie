import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Downloadie — A Modern Multi-Platform Media Downloader",
  description:
    "Paste a supported media link to discover available download options for content you own or are authorized to save. Fast, honest, and privacy-conscious.",
  keywords: [
    "media downloader",
    "direct media download",
    "video inspector",
    "mp4 download",
    "privacy-first downloader",
    "Downloadie",
  ],
  authors: [{ name: "Downloadie Team" }],
  metadataBase: new URL("https://downloadie.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Downloadie — Multi-Platform Media Downloader",
    description:
      "Paste a supported media link to discover available download options for content you own or are authorized to save.",
    url: "https://downloadie.app",
    siteName: "Downloadie",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Downloadie — Multi-Platform Media Downloader",
    description:
      "Fast, honest, and privacy-conscious media downloader. No password harvesting, no fake download buttons.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-white text-slate-900 antialiased selection:bg-brand-100 selection:text-brand-900">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
