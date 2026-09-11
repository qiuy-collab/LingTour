import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPanel } from "@/components/ui/LoginPanel";

export const metadata: Metadata = {
  title: "Welcome back | Culvoy Guangdong",
  description: "Sign in to return to your saved Culvoy routes, field notes, and bookings.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-[var(--paper-deep)]" />}>
      <LoginPanel />
    </Suspense>
  );
}
