"use client";

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

  if (loading) return <LoadingSpinner text="Loading product…" />;
  if (error) return <ErrorState message={error} />;

  if (!product) {
    return (
      <div className="site-container flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--cinnabar)]">Not found</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Product not found.</p>
        </div>
      </div>
    );
  }

  const relatedProducts = (allProducts ?? [])
    .filter((p) => p.slug !== product.slug && p.collection === product.collection)
    .slice(0, 3);

  return (
    <main>
      <ProductDetailHero product={product} />

      <ProductNarrative product={product} />

      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className="site-container">
            <Reveal>
              <p className="text-label text-[var(--cinnabar)]">Related items</p>
              <h2 className="mt-5 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] md:text-4xl">
                Completing the {product.collection} collection.
              </h2>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p, i) => (
                <StoreProductCard key={p.slug} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
