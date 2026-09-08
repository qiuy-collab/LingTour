import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPanel } from "@/components/ui/LoginPanel";

export const metadata: Metadata = {
  title: "Log in | LingTour Guangdong",
  description: "Access your saved LingTour routes, bookings, collection, and traveler profile.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[var(--paper-deep)]" />}>
      <LoginPanel />
    </Suspense>
  );
}
