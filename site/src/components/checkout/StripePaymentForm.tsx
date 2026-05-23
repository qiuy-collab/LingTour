"use client";

import { useCallback, useState } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

type PaymentFormInnerProps = {
  orderNo: string;
  onSuccess: () => void;
  onError: (message: string) => void;
};

function PaymentFormInner({ orderNo, onSuccess, onError }: PaymentFormInnerProps) {
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
          return_url: `${window.location.origin}/checkout/success?orderNo=${orderNo}`,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message ?? "Payment failed. Please try again.");
        setProcessing(false);
      } else {
        onSuccess();
      }
    },
    [stripe, elements, orderNo, onSuccess, onError],
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
        {processing ? "Processing payment..." : "Pay now"}
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
  if (!stripePromise) {
    return (
      <div className="border-l-2 border-[var(--gold)] bg-[var(--gold)]/6 px-4 py-3 text-sm text-[var(--muted)]">
        Stripe is not configured. Set{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
        to enable live payments.
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
            colorPrimary: "#2d4a3e",
            borderRadius: "4px",
            fontFamily: "system-ui, sans-serif",
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
