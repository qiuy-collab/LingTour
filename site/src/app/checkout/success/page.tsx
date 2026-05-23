"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get("orderNo") ?? "—";

  return (
    <main className="min-h-screen bg-[var(--paper-deep)] bg-grain px-6 py-16 text-[var(--river-deep)] lg:px-16">
      <div className="mx-auto max-w-3xl border border-[var(--line)] bg-[var(--paper)] p-10 scrapbook-shadow">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
          Payment confirmed
        </p>
        <h1 className="mt-4 font-[family:var(--font-display)] text-5xl italic">
          Thank you.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
          Your payment has been processed successfully. We&apos;ll begin
          preparing your order for shipment shortly.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="border border-[var(--line)] bg-white/65 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Order no.
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
              {orderNo}
            </p>
          </div>
          <div className="border border-[var(--line)] bg-white/65 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Status
            </p>
            <p className="mt-2 text-lg font-bold capitalize text-[var(--river-deep)]">
              Confirmed
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/shop" className="btn-primary px-8 py-4 text-xs">
            Continue browsing
          </Link>
          <Link href="/community" className="btn-paper px-8 py-4 text-xs">
            Visit community
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--paper-deep)]">
          <p className="text-sm text-[var(--muted)]">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
