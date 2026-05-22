import { Suspense } from "react";
import { fetchStoreProducts } from "@/lib/api-data";
import type { Locale } from "@/lib/locale";

const SEEDED_PRODUCT_SLUGS = ["volcanic-soil-bowl"];

export async function generateStaticParams() {
  const locales: Locale[] = ["en", "zh"];
  const slugSet = new Set(SEEDED_PRODUCT_SLUGS);

  for (const locale of locales) {
    try {
      const products = await fetchStoreProducts(locale);
      for (const product of products) {
        slugSet.add(product.slug);
      }
    } catch {
      // Keep build coverage from seeded product slugs when the API is not reachable.
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
