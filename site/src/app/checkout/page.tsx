import { Suspense } from "react";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-10">Loading checkout...</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
