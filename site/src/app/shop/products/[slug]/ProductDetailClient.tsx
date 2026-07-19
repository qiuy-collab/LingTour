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
        <section className="site-container py-16 sm:py-20 lg:py-28 xl:py-32">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-xl">
                <p className="handwritten text-xl text-[var(--gold)]">Related items</p>
                <h2 className="mt-4 max-w-[15ch] font-[family:var(--font-display)] text-4xl leading-[0.98] text-[var(--river-deep)] sm:text-5xl">
                  Objects from the <span className="italic">same</span> memory line.
                </h2>
              </div>
              <Link
                href="/shop"
                className="btn-outline min-h-12 w-full border-[var(--river-deep)] px-6 py-3 text-[var(--river-deep)] hover:bg-[var(--river-deep)] hover:text-white md:w-auto"
              >
                View all objects
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-8 sm:mt-16 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {relatedProducts.map((item, index) => (
              <div key={item.slug} className={index === 1 ? "lg:mt-12" : index === 2 ? "lg:mt-6" : ""}>
                <StoreProductCard product={item} index={index} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pb-20 sm:pb-24 lg:pb-32">
        <div className="site-container">
          <Reveal>
            <div className="relative -rotate-[0.25deg] overflow-hidden bg-[var(--river-deep)] bg-grain px-6 py-16 text-center text-white scrapbook-shadow sm:px-10 sm:py-20 lg:px-20 lg:py-28">
              <div className="absolute left-1/2 top-0 h-8 w-28 -translate-x-1/2 -translate-y-1/2 rotate-2 border border-white/10 bg-white/15 backdrop-blur-sm" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.14),transparent_70%)]" />
              <div className="relative z-10 mx-auto max-w-2xl">
                <p className="handwritten text-xl text-[var(--gold)] sm:text-2xl">Continue exploring</p>
                <h2 className="mt-6 font-[family:var(--font-display)] text-4xl leading-tight sm:mt-8 md:text-6xl">
                  Let the next object lead you <span className="italic">back</span> into the journey.
                </h2>
                <div className="mt-9 sm:mt-12">
                  <Link
                    href="/shop"
                    className="btn-primary inline-flex min-h-12 w-full items-center justify-center bg-[var(--gold)] px-7 py-3 text-[var(--river-deep)] hover:bg-white sm:w-auto"
                  >
                    Back to store
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
