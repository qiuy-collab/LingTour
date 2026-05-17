"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchStoreCollections, fetchStoreProducts } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { Reveal } from "@/components/ui/Reveal";

export default function ShopPage() {
  const { locale } = useLocale();

  const { data: storeCollections, loading: colsLoading, error: colsError } = useApiQuery(
    () => fetchStoreCollections(locale),
    [locale],
  );

  const { data: storeProducts, loading: prodLoading, error: prodError } = useApiQuery(
    () => fetchStoreProducts(locale),
    [locale],
  );

  if (colsLoading || prodLoading) return <LoadingSpinner text="Opening the store..." />;
  if (colsError || prodError) return <ErrorState message={colsError || prodError || "Failed to load"} />;

  const collections = storeCollections ?? [];
  const products = storeProducts ?? [];

  return (
    <div className="bg-[var(--paper-deep)]">
      <section className="relative overflow-hidden bg-[var(--night)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 hero-zoom"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1800&q=82)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.46),rgba(17,25,35,0.86))]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(0deg,var(--paper-deep),transparent)]" />

        <div className="site-container relative flex min-h-[46vh] flex-col justify-center py-20 lg:min-h-[56vh] lg:py-28">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
              Lingnan Store
            </p>
            <h1 className="mt-6 max-w-[12ch] font-[family:var(--font-display)] text-[3.2rem] leading-[0.94] tracking-[-0.03em] sm:text-7xl md:text-8xl">
              Take the journey home by hand.
            </h1>
            <div className="mt-8 h-px w-24 bg-[var(--gold)]/40" />
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66">
              Craft, tea, wood, clay, cloth: objects chosen because they still carry the route, the maker, and the place they came from.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="site-container -mt-12 py-12 lg:py-20">
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cinnabar)]">
            Collections
          </p>
          <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] md:text-4xl">
            Collected by place, not trend.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, i) => (
            <Reveal key={collection.title} delay={i * 100}>
              <Link href={collection.href} className="group block">
                <article className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--night)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(17,25,35,0.15)]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: `url(${collection.image})` }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,25,35,0.95),rgba(17,25,35,0.15)_60%,rgba(17,25,35,0))]" />
                  <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">{collection.route}</p>
                    <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-tight lg:text-4xl">
                      {collection.title}
                    </h3>
                    <p className="mt-5 text-sm leading-7 text-white/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      {collection.body}
                    </p>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cinnabar)]">
              Featured
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] md:text-4xl">
              Small objects, long memory.
            </h2>
          </div>
          <Link
            href="/shop/products"
            className="text-xs font-bold uppercase tracking-widest text-[var(--cinnabar)] transition-colors hover:text-[var(--cinnabar-deep)]"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.slice(0, 3).map((product, i) => (
            <StoreProductCard key={product.slug} product={product} index={i} />
          ))}
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--night)] px-8 py-16 text-center text-white lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.08),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  Gifting
                </p>
                <h2 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight md:text-5xl">
                  Give something with a place inside it.
                </h2>
                <div className="mt-8">
                  <Link
                    href="/shop/products"
                    className="inline-block bg-[var(--gold)] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--night)] transition-all hover:bg-white"
                  >
                    Browse all products
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
