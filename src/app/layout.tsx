import "./globals.css";
import type { Metadata } from "next";
import { CarouselRuntime } from "@/components/layout/CarouselRuntime";
import { FavoriteRuntime } from "@/components/layout/FavoriteRuntime";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

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
    <html lang="en">
      <body>
        <CarouselRuntime />
        <FavoriteRuntime />
        <div className="min-h-screen text-[var(--ink)]">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
