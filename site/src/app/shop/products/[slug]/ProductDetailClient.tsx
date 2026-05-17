"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale } from "@/lib/locale-context";
import { fetchStoreProductBySlug, fetchStoreProducts } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { ProductDetailHero } from "@/components/store/ProductDetailHero";
import { ProductNarrative } from "@/components/store/ProductNarrative";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { Reveal } from "@/components/ui/Reveal";
import type { StoreProduct } from "@/data/store";

interface Props {
  slug: string;
}

export function ProductDetailClient({ slug }: Props) {
  const { locale, setLocale } = useLocale();
  const { previewData, previewLocale, previewEnabled } = usePreviewBridge<StoreProduct>("product");
  const activeLocale = previewLocale ?? locale;

  useEffect(() => {
    if (previewLocale && previewLocale !== locale) {
      setLocale(previewLocale);
    }
  }, [locale, previewLocale, setLocale]);

  const { data: product, loading, error } = useApiQuery(
    () => fetchStoreProductBySlug(slug, activeLocale),
    [slug, activeLocale],
  );

  const { data: allProducts } = useApiQuery(
    () => fetchStoreProducts(activeLocale),
    [activeLocale],
  );

  const activeProduct = previewData ?? product;

  if (previewEnabled && !activeProduct) return <LoadingSpinner text="Loading preview..." />;
  if (loading && !activeProduct) return <LoadingSpinner text="Preparing the object..." />;
  if (error && !activeProduct) return <ErrorState message={error} />;

  if (!activeProduct) {
    return (
      <div className="site-container flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--cinnabar)]">Not found</p>
        </div>
      </div>
    );
  }

  const relatedProducts = (allProducts ?? [])
    .filter((p) => p.slug !== activeProduct.slug)
    .slice(0, 3);

  return (
    <main className="relative min-h-screen bg-[var(--paper-deep)] bg-grain">
      <ProductDetailHero product={activeProduct} />
      <ProductNarrative product={activeProduct} />

      {relatedProducts.length > 0 && (
        <section className="site-container py-24 lg:py-32">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-xl">
                <p className="font-handwritten text-xl text-[var(--gold)]">
                  Related items
                </p>
                <h2 className="mt-4 font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] md:text-5xl">
                  Objects from the <span className="italic">same</span> memory line.
                </h2>
              </div>
              <Link
                href="/shop"
                className="btn-outline border-[var(--river-deep)] text-[var(--river-deep)] hover:bg-[var(--river-deep)] hover:text-white"
              >
                View all objects
              </Link>
            </div>
          </Reveal>

          <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((p, i) => (
              <div key={p.slug} className={i === 1 ? "lg:mt-12" : i === 2 ? "lg:mt-6" : ""}>
                <StoreProductCard product={p} index={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pb-24 lg:pb-32">
        <div className="site-container">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-8 py-20 text-center text-white lg:px-20 lg:py-28 scrapbook-shadow">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.12),transparent_70%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <p className="font-handwritten text-2xl text-[var(--gold)]">
                Continue exploring
              </p>
              <h2 className="mt-8 font-[family:var(--font-display)] text-4xl leading-tight md:text-6xl">
                Let the next object lead you <span className="italic">back</span> into the journey.
              </h2>
              <div className="mt-12">
                <Link
                  href="/shop"
                  className="btn-primary bg-[var(--gold)] text-[var(--river-deep)] hover:bg-white"
                >
                  Back to store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
