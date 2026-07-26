import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchStoreProducts } from "@/lib/api-data";
import {
  fetchStoreProductBySlugServer,
  fetchStoreProductsServer,
} from "@/lib/server-data";

const SEEDED_PRODUCT_SLUGS = ["volcanic-soil-bowl"];

export const revalidate = 60;

export async function generateStaticParams() {
  const slugSet = new Set(SEEDED_PRODUCT_SLUGS);

  try {
    const products = await fetchStoreProducts();
    for (const product of products) {
      slugSet.add(product.slug);
    }
  } catch {
    // Keep build coverage from seeded product slugs when the API is not reachable.
  }

  return Array.from(slugSet).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchStoreProductBySlugServer(slug);
  if (!product) return {};

  const title = `${product.name} | Shop | LingTour Guangdong`;
  const description =
    product.story?.trim() ||
    product.materialNotes?.trim() ||
    `${product.name} from the ${product.collection} collection, made in Guangdong.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [initialProduct, initialProducts] = await Promise.all([
    fetchStoreProductBySlugServer(slug),
    fetchStoreProductsServer(),
  ]);
  const { ProductDetailClient } = await import("./ProductDetailClient");
  return (
    <Suspense fallback={null}>
      <ProductDetailClient
        slug={slug}
        initialProduct={initialProduct}
        initialProducts={initialProducts}
      />
    </Suspense>
  );
}
