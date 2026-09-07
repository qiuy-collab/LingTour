import type { Metadata } from "next";
import { CultureDetailClient } from "@/app/culture/[slug]/CultureDetailClient";

export const metadata: Metadata = { title: "City preview", robots: { index: false, follow: false } };

export default function CityPreviewPage() {
  return <CultureDetailClient previewOnly slug="preview-city" initialCity={null} initialCityCultures={[]} initialRoutes={[]} />;
}
