"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchStoreProductBySlug, fetchStoreProducts } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { ProductDetailHero } from "@/components/store/ProductDetailHero";
import { ProductNarrative } from "@/components/store/ProductNarrative";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { Reveal } from "@/components/ui/Reveal";

interface Props {
  slug: string;
}

export function ProductDetailClient({ slug }: Props) {
  const { locale } = useLocale();

  const { data: product, loading, error } = useApiQuery(
    () => fetchStoreProductBySlug(slug, locale),
    [slug, locale],
  );

  const { data: allProducts } = useApiQuery(
    () => fetchStoreProducts(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Preparing the object..." />;
  if (error) return <ErrorState message={error} />;

  if (!product) {
    return (
      <div className="site-container flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--cinnabar)]">Not found</p>
        </div>
      </div>
    );
  }

  const relatedProducts = (allProducts ?? [])
    .filter((p) => p.slug !== product.slug)
    .slice(0, 3);

  return (
    <main className="bg-[var(--paper-deep)]">
      <ProductDetailHero product={product} />
      <ProductNarrative product={product} />

      {relatedProducts.length > 0 && (
        <section className="site-container py-16 lg:py-24">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cinnabar)]">
              Related items
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] md:text-4xl">
              Objects from the same memory line.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((p, i) => (
              <StoreProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="pb-16 lg:pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--night)] px-8 py-16 text-center text-white lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.08),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                Continue exploring
              </p>
              <h2 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight md:text-5xl">
                Let the next object lead you back into the journey.
              </h2>
              <div className="mt-8">
                <Link
                  href="/shop"
                  className="inline-block bg-[var(--gold)] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--night)] transition-all hover:bg-white"
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
