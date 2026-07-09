import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { GlobalDrawer } from "@/components/layout/GlobalDrawer";
import { PageTransition } from "@/components/layout/PageTransition";
import { LocaleProvider } from "@/lib/locale-context";
import { UIProvider } from "@/lib/ui-context";

export const metadata: Metadata = {
  title: "LingTour Guangdong",
  description:
    "LingTour connects Guangdong culture, story-driven routes, interpreting services, and Lingnan-inspired retail for international visitors.",
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
          <UIProvider>
            <div className="min-h-screen text-[var(--ink)]">
              <SiteHeader />
              <main>
                <PageTransition>{children}</PageTransition>
              </main>
              <SiteFooter />
              <GlobalDrawer />
            </div>
          </UIProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
