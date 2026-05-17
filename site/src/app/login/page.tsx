"use client";

import Link from "next/link";
import { LoginPanel } from "@/components/ui/LoginPanel";

export default function LoginPage() {
  return (
    <div className="bg-[var(--paper-deep)] text-[var(--river-deep)]">
      <section className="site-container grid min-h-[calc(100svh-73px)] place-items-center py-12">
        <div className="w-full max-w-[440px]">
          <div className="mb-8 text-center">
            <p className="font-[family:var(--font-display)] text-3xl leading-none text-[var(--river-deep)]">
              LingTour
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Return to your saved routes, bookings, and quiet plans.
            </p>
          </div>

          <div>
            <LoginPanel />
            <div className="mt-4 text-center text-sm">
              <Link href="/culture" className="text-[var(--muted)] transition hover:text-[var(--river-deep)]">
                Continue browsing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
