"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "@/lib/api-client";
import { finalizePaidCheckout } from "@/lib/cart";
import { useLocale } from "@/lib/locale-context";
import {
  type PublicOrderStatus,
  verifyPaymentResult,
} from "@/lib/payment-result";

type PaymentResultState =
  | "checking"
  | "pending"
  | "confirmed"
  | "failed"
  | "timeout";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { t } = useLocale();
  const orderNo = searchParams.get("orderNo");
  const statusToken = searchParams.get("statusToken");
  const provider = searchParams.get("provider");
  const paypalOrderId = searchParams.get("token");
  const [resultState, setResultState] =
    useState<PaymentResultState>("checking");
  const [order, setOrder] = useState<PublicOrderStatus | null>(null);
  const verificationRun = useRef(0);
  const finalizedOrder = useRef<string | null>(null);

  const verifyOrder = useCallback(async () => {
    const run = ++verificationRun.current;
    setResultState("checking");

    const result = await verifyPaymentResult(
      { orderNo, statusToken, provider, paypalOrderId },
      {
        capturePayPal: (paypalId) =>
          apiPost("/orders/paypal/capture", { paypalOrderId: paypalId }),
        getStatus: (trustedOrderNo, trustedStatusToken) =>
          apiGet<PublicOrderStatus>("/orders/status", {
            orderNo: trustedOrderNo,
            token: trustedStatusToken,
          }),
        onPending: (pendingOrder) => {
          if (verificationRun.current !== run) return;
          setOrder(pendingOrder);
          setResultState("pending");
        },
      },
    );

    if (verificationRun.current !== run) return;
    setOrder(result.order ?? null);
    setResultState(result.state);

    if (
      result.state === "confirmed" &&
      finalizedOrder.current !== result.order.orderNo
    ) {
      finalizedOrder.current = result.order.orderNo;
      finalizePaidCheckout(result.order.orderNo, result.order.orderType);
    }
  }, [orderNo, paypalOrderId, provider, statusToken]);

  useEffect(() => {
    void verifyOrder();
    return () => {
      verificationRun.current += 1;
    };
  }, [verifyOrder]);

  const isBusy = resultState === "checking" || resultState === "pending";
  const isConfirmed = resultState === "confirmed";
  const isInterpretingDeposit = order?.orderType === "interpreting_deposit";

  const copyByState: Record<
    PaymentResultState,
    { eyebrow: string; title: string; body: string }
  > = {
    checking: {
      eyebrow: t("checkout.success.verifying"),
      title: t("checkout.success.verifyingTitle"),
      body: t("checkout.success.verifyingMessage"),
    },
    pending: {
      eyebrow: t("checkout.success.paymentPending"),
      title: t("checkout.success.pendingTitle"),
      body: t("checkout.success.pendingMessage"),
    },
    confirmed: {
      eyebrow: t("checkout.success.paymentConfirmed"),
      title: t("checkout.success.thankYou"),
      body: isInterpretingDeposit
        ? t("checkout.success.depositMessage")
        : t("checkout.success.paymentMessage"),
    },
    failed: {
      eyebrow: t("checkout.success.paymentNotConfirmed"),
      title: t("checkout.success.failedTitle"),
      body:
        order?.paymentStatus === "refunded"
          ? t("checkout.success.refundedMessage")
          : t("checkout.success.failedMessage"),
    },
    timeout: {
      eyebrow: t("checkout.success.stillChecking"),
      title: t("checkout.success.timeoutTitle"),
      body: t("checkout.success.timeoutMessage"),
    },
  };
  const copy = copyByState[resultState];

  const statusLabel = (() => {
    if (resultState === "checking") return t("checkout.success.statusVerifying");
    if (resultState === "confirmed") return t("checkout.success.statusConfirmed");
    if (order?.paymentStatus === "refunded") {
      return t("checkout.success.statusRefunded");
    }
    if (resultState === "failed") return t("checkout.success.statusFailed");
    return t("checkout.success.statusPending");
  })();

  return (
    <div className="min-h-screen bg-[var(--paper-deep)] bg-grain px-4 py-12 text-[var(--river-deep)] sm:px-6 sm:py-16 lg:px-16 lg:py-24">
      <div
        aria-busy={isBusy}
        aria-live="polite"
        className="mx-auto max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-panel"
      >
        <div className="bg-[var(--night)] px-6 py-8 text-white sm:px-10 sm:py-10">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--gold-light)]">
            {copy.eyebrow}
          </p>
          <h1 className="mt-5 font-[family:var(--font-display)] text-5xl leading-[0.92] tracking-[-0.05em] sm:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
            {copy.body}
          </p>
        </div>

        <div className="p-6 sm:p-10">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white/65 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                {t("checkout.success.orderNo")}
              </p>
              <p className="mt-2 break-all text-lg font-bold text-[var(--river-deep)]">
                {orderNo || t("checkout.success.orderUnavailable")}
              </p>
            </div>
            <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white/65 p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--muted)]">
                {t("checkout.success.status")}
              </p>
              <p className="mt-2 text-lg font-bold text-[var(--river-deep)]">
                {statusLabel}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            {isConfirmed ? (
              <Link
                href={isInterpretingDeposit ? "/interpreting" : "/shop"}
                className="lt-action lt-action-primary"
              >
                {isInterpretingDeposit
                  ? t("checkout.success.returnToInterpreting")
                  : t("checkout.success.continueBrowsing")}
              </Link>
            ) : (
              <button
                type="button"
                className="lt-action lt-action-primary"
                disabled={isBusy}
                onClick={() => void verifyOrder()}
              >
                {isBusy
                  ? t("checkout.success.checkingAgain")
                  : t("checkout.success.checkAgain")}
              </button>
            )}
            <Link href="/community" className="lt-action lt-action-secondary">
              {t("checkout.success.visitCommunity")}
            </Link>
          </div>
        </div>
      </div>
    </div>
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
