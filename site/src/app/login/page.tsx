import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginPanel } from "@/components/ui/LoginPanel";

export const metadata: Metadata = {
  title: "Log in | LingTour Guangdong",
  description: "Access your saved LingTour routes, bookings, collection, and traveler profile.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--night)] text-[var(--river-deep)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(197,160,57,0.16),transparent_30%),radial-gradient(circle_at_88%_30%,rgba(83,131,147,0.2),transparent_38%)]" />
      <section className="site-container grid min-h-[calc(100dvh-73px)] items-start py-4 sm:py-6 lg:items-center lg:py-9">
        <div className="relative mx-auto w-full max-w-6xl">
          <Suspense fallback={<div className="min-h-[38rem] rounded-[var(--radius-xl)] bg-white/8" />}>
            <LoginPanel />
          </Suspense>
          <div className="mt-6 text-center text-sm">
            <Link
              href="/culture"
              className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white/48 transition hover:text-white"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
