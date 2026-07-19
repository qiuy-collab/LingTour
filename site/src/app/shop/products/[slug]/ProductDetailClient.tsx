"use client";

import Link from "next/link";
import { useEffect } from "react";
import { notFound } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { fetchStoreProductBySlug, fetchStoreProducts } from "@/lib/api-data";
import { usePreviewBridge } from "@/lib/preview";
import { ErrorState, LoadingSpinner, useApiQuery } from "@/lib/use-api-query";
import { ProductDetailHero } from "@/components/store/ProductDetailHero";
import { ProductNarrative } from "@/components/store/ProductNarrative";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { Reveal } from "@/components/ui/Reveal";
import type { StoreProduct } from "@/data/store";

interface Props {
  slug: string;
  initialProduct: StoreProduct | null;
  initialProducts: StoreProduct[];
}

export function ProductDetailClient({ slug, initialProduct, initialProducts }: Props) {
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
    { initialData: initialProduct },
  );

  const { data: allProducts } = useApiQuery(
    () => fetchStoreProducts(activeLocale),
    [activeLocale],
    { initialData: initialProducts },
  );

  const activeProduct = previewData ?? product ?? initialProduct;

  if (previewEnabled && !activeProduct) return <LoadingSpinner text="Loading preview..." />;
  if (loading && !activeProduct) return <LoadingSpinner text="Preparing the object..." />;
  if (error && !activeProduct) {
    return (
      <ErrorState
        title="Object file unavailable"
        message="This object's record can't be reached right now. Please try again shortly."
      />
    );
  }

  if (!activeProduct) {
    notFound();
  }

  const relatedProducts = (allProducts ?? initialProducts)
    .filter((item) => item.slug !== activeProduct.slug)
    .slice(0, 3);

  return (
    <main className="relative min-h-screen bg-[var(--paper-deep)] bg-grain">
      <ProductDetailHero product={activeProduct} />
      <ProductNarrative product={activeProduct} />

      {relatedProducts.length > 0 && (
        <section className="site-container py-16 sm:py-20 lg:py-24">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                  Related objects
                </p>
                <h2 className="mt-5 font-[family:var(--font-display)] text-4xl leading-[0.98] tracking-[-0.04em] text-[var(--river-deep)] md:text-6xl">
                  Objects from the <span className="italic">same</span> memory line.
                </h2>
              </div>
              <Link
                href="/shop"
                className="lt-action lt-action-secondary"
              >
                View all objects
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item, index) => (
              <StoreProductCard key={item.slug} product={item} index={index} />
            ))}
          </div>
        </section>
      )}

      <section className="pb-20 lg:pb-28">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--river-deep)] px-7 py-16 text-center text-white shadow-[0_28px_90px_rgba(17,25,35,0.2)] sm:px-10 sm:py-20 lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.12),transparent_70%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
                Continue exploring
              </p>
              <h2 className="mt-8 font-[family:var(--font-display)] text-4xl leading-tight md:text-6xl">
                Let the next object lead you <span className="italic">back</span> into the journey.
              </h2>
              <div className="mt-10">
                <Link
                  href="/shop"
                  className="lt-action lt-action-gold"
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
