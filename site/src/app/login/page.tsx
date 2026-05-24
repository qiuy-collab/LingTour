"use client";

import Link from "next/link";
import { LoginPanel } from "@/components/ui/LoginPanel";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)]">
      <section className="site-container grid min-h-[calc(100svh-73px)] items-center py-8 lg:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <LoginPanel />
          <div className="mt-6 text-center text-sm">
            <Link
              href="/culture"
              className="text-[var(--muted)] transition hover:text-[var(--river-deep)] handwritten italic"
            >
              Continue browsing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
