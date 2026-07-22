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
    <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--paper-deep)] text-[var(--river-deep)]">
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_14%,rgba(185,138,70,0.12),transparent_30%),radial-gradient(circle_at_88%_28%,rgba(83,131,147,0.13),transparent_38%)]" />
      <section className="site-container grid min-h-[calc(100dvh-73px)] items-start py-4 sm:py-6 lg:items-center lg:py-9">
        <div className="relative mx-auto w-full max-w-6xl">
          <Suspense fallback={<div className="min-h-[38rem] rounded-[var(--radius-xl)] border border-[var(--line)] bg-white/45" />}>
            <LoginPanel />
          </Suspense>
          <div className="mt-6 text-center text-sm">
            <Link
              href="/culture"
                className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--river-deep)]"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
