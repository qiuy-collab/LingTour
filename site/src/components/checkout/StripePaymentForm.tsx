"use client";

import { useCallback, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocale } from "@/lib/locale-context";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type PaymentFormInnerProps = {
  orderNo: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function PaymentFormInner({ orderNo, onSuccess, onError }: PaymentFormInnerProps) {
  const { t } = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!stripe || !elements) return;

      setProcessing(true);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?orderNo=${encodeURIComponent(orderNo)}&status=confirmed`,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message ?? t("checkout.payment.failed"));
        setProcessing(false);
      } else {
        onSuccess();
      }
    },
    [stripe, elements, orderNo, onSuccess, onError, t],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition ${
          !processing
            ? "bg-[var(--river-deep)] text-white hover:bg-[var(--cinnabar)]"
            : "cursor-not-allowed bg-[var(--line)] text-[var(--muted)]"
        }`}
      >
        {processing ? t("checkout.payment.processing") : t("checkout.payment.payNow")}
      </button>
    </form>
  );
}

type StripePaymentFormProps = {
  clientSecret: string;
  orderNo: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export function StripePaymentForm({
  clientSecret,
  orderNo,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const { t } = useLocale();

  if (!stripePromise) {
    return (
      <div className="border border-[var(--gold)]/30 bg-[var(--gold)]/8 px-4 py-3 text-sm text-[var(--muted)]">
        {t("checkout.payment.unavailable")}
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#14343d",
            colorText: "#17202a",
            colorDanger: "#842b23",
            colorBackground: "#f4f2ee",
            borderRadius: "0px",
            fontFamily:
              '"Trebuchet MS", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          },
        },
      }}
    >
      <PaymentFormInner
        orderNo={orderNo}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
