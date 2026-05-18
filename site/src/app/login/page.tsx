"use client";

import Link from "next/link";
import { LoginPanel } from "@/components/ui/LoginPanel";

export default function LoginPage() {
  return (
    <div className="bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)] min-h-screen">
      <section className="site-container grid min-h-[calc(100svh-73px)] place-items-center py-12">
        <div className="w-full max-w-[440px] relative">
          <div className="absolute -top-12 -left-8 w-24 h-24 bg-[var(--gold)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mb-8 text-center relative z-10">
            <p className="font-[family:var(--font-display)] text-5xl italic leading-none text-[var(--river-deep)]">
              LingTour
            </p>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] handwritten">
              Return to your saved routes, bookings, and quiet plans.
            </p>
          </div>

          <div className="relative z-10">
            <LoginPanel />
            <div className="mt-8 text-center text-sm">
              <Link href="/culture" className="text-[var(--muted)] transition hover:text-[var(--river-deep)] handwritten italic">
                Continue browsing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
