import type { Metadata } from "next";
import { LoginPanel } from "@/components/ui/LoginPanel";

export const metadata: Metadata = {
  title: "Welcome back | Culvoy Guangdong",
  description: "Sign in to return to your saved Culvoy routes, field notes, and bookings.",
};

export default function LoginPage() {
  return <LoginPanel />;
}
