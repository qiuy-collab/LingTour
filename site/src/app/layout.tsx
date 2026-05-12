import "./globals.css";
import type { Metadata } from "next";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
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
