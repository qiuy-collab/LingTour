"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useLocale } from "@/lib/locale-context";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const orderNo = searchParams.get("orderNo") ?? "-";
  const status = searchParams.get("status") ?? "confirmed";

  const formatOrderStatus = (value: string) => {
    const statusKeyMap: Record<string, string> = {
      pending: "checkout.success.statusPending",
      confirmed: "checkout.success.statusConfirmed",
      shipped: "checkout.success.statusShipped",
      delivered: "checkout.success.statusDelivered",
      cancelled: "checkout.success.statusCancelled",
    };

    const key = statusKeyMap[value];
    return key ? t(key) : value.replace(/_/g, " ");
  };

  return (
    <main className="min-h-screen bg-[var(--paper-deep)] bg-grain px-6 py-16 text-[var(--river-deep)] lg:px-16">
      <div className="mx-auto max-w-3xl border border-[var(--line)] bg-[var(--paper)] p-10 scrapbook-shadow">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--cinnabar)]">
          {t("checkout.success.paymentConfirmed")}
        </p>
        <h1 className="mt-4 font-[family:var(--font-display)] text-5xl italic">
          {t("checkout.success.thankYou")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--muted)]">
          {t("checkout.success.paymentMessage")}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="border border-[var(--line)] bg-white/65 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {t("checkout.success.orderNo")}
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
              {orderNo}
            </p>
          </div>
          <div className="border border-[var(--line)] bg-white/65 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {t("checkout.success.status")}
            </p>
            <p className="mt-2 text-lg font-bold capitalize text-[var(--river-deep)]">
              {formatOrderStatus(status)}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/shop" className="btn-primary px-8 py-4 text-xs">
            {t("checkout.success.continueBrowsing")}
          </Link>
          <Link href="/community" className="btn-paper px-8 py-4 text-xs">
            {t("checkout.success.visitCommunity")}
          </Link>
        </div>
      </div>
    </main>
  );
}

function SuccessFallback() {
  const { t } = useLocale();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--paper-deep)]">
      <p className="text-sm text-[var(--muted)]">
        {t("checkout.empty.loading")}
      </p>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<SuccessFallback />}>
      <SuccessContent />
    </Suspense>
  );
}
