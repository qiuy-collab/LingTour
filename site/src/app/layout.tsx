import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { GlobalDrawer } from "@/components/layout/GlobalDrawer";
import { PageTransition } from "@/components/layout/PageTransition";
import { LocaleProvider } from "@/lib/locale-context";
import { UIProvider } from "@/lib/ui-context";
import type { Locale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "LingTour Guangdong",
  description:
    "LingTour connects Guangdong culture, story-driven routes, interpreting services, and Lingnan-inspired retail for international visitors.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from cookie set by middleware / client setLocale()
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("lingtour-locale")?.value;
  const initialLocale: Locale = localeCookie === "zh" ? "zh" : "en";

  return (
    <html
      lang={initialLocale === "zh" ? "zh-CN" : "en"}
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
        <LocaleProvider initialLocale={initialLocale}>
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
