import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { LocaleProvider } from "@/lib/locale-context";

export const metadata: Metadata = {
  title: "Culvoy Guangdong",
  description:
    "Story routes through Guangdong's three cultures — a crater lake in Zhanjiang, gongfu tea in Chaozhou, morning dim sum in Guangzhou — with a local interpreter at your side.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      style={{ backgroundColor: "#ece9e2" }}
    >
      <body>
        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
          <Script
            src="https://accounts.google.com/gsi/client"
            strategy="lazyOnload"
          />
        )}
        <LocaleProvider>
          <div className="min-h-screen text-[var(--ink)]">
            <ScrollProgress />
            <SiteHeader />
            <main>
              <PageTransition>{children}</PageTransition>
            </main>
            <SiteFooter />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
