import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfilePageClient } from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "Traveler Profile | LingTour Guangdong",
  description: "Your LingTour field notes, saved routes, collection, bookings, and traveler settings.",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfilePageClient />
    </Suspense>
  );
}
