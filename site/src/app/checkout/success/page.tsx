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
    <main className="min-h-screen bg-[var(--paper-deep)] bg-grain px-4 py-12 text-[var(--river-deep)] sm:px-6 sm:py-16 lg:px-16 lg:py-24">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_28px_90px_rgba(17,25,35,0.12)]">
        <div className="bg-[var(--night)] px-6 py-8 text-white sm:px-10 sm:py-10">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--gold)]">
          {t("checkout.success.paymentConfirmed")}
        </p>
        <h1 className="mt-5 font-[family:var(--font-display)] text-5xl leading-[0.92] tracking-[-0.05em] sm:text-6xl">
          {t("checkout.success.thankYou")}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
          {t("checkout.success.paymentMessage")}
        </p>
        </div>

        <div className="p-6 sm:p-10">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white/65 p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {t("checkout.success.orderNo")}
            </p>
            <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
              {orderNo}
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white/65 p-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {t("checkout.success.status")}
            </p>
            <p className="mt-2 text-lg font-bold capitalize text-[var(--river-deep)]">
              {formatOrderStatus(status)}
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/shop" className="lt-action lt-action-primary">
            {t("checkout.success.continueBrowsing")}
          </Link>
          <Link href="/community" className="lt-action lt-action-secondary">
            {t("checkout.success.visitCommunity")}
          </Link>
        </div>
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
