import { Suspense } from "react";
import { fetchStoreProducts } from "@/lib/api-data";
import type { Locale } from "@/lib/locale";

// Hardcoded fallbacks from seed data — guarantees build succeeds without API
const FALLBACK_SLUGS = ["volcanic-soil-bowl"];

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "zh"];
  const slugSet = new Set(FALLBACK_SLUGS);

  for (const locale of locales) {
    try {
      const products = await fetchStoreProducts(locale);
      for (const product of products) {
        slugSet.add(product.slug);
      }
    } catch {
      // API unavailable — fallback slugs cover the build
    }
  }

  return Array.from(slugSet).map((slug) => ({ slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { ProductDetailClient } = await import("./ProductDetailClient");
  return (
    <Suspense fallback={null}>
      <ProductDetailClient slug={slug} />
    </Suspense>
  );
}
