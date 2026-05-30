"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchStoreCollections, fetchStoreProducts } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";
import type { StoreCollection, StoreProduct } from "@/data/store";

interface ShopPageClientProps {
  initialCollections: StoreCollection[];
  initialProducts: StoreProduct[];
}

export default function ShopPageClient({
  initialCollections,
  initialProducts,
}: ShopPageClientProps) {
  const { t, locale } = useLocale();

  const {
    data: storeCollections,
    loading: colsLoading,
    error: colsError,
    refetch: refetchCollections,
  } = useApiQuery(() => fetchStoreCollections(locale), [locale], {
    initialData: initialCollections,
  });

  const {
    data: storeProducts,
    loading: prodLoading,
    error: prodError,
    refetch: refetchProducts,
  } = useApiQuery(() => fetchStoreProducts(locale), [locale], {
    initialData: initialProducts,
  });

  if (colsLoading && prodLoading && initialCollections.length === 0 && initialProducts.length === 0) {
    return <LoadingSpinner text="Opening the shelf..." />;
  }

  if ((colsError || prodError) && initialCollections.length === 0 && initialProducts.length === 0) {
    return (
      <ErrorState
        title="Store unavailable"
        message="We can't load the shop right now. Please try again shortly."
        onRetry={() => {
          void refetchCollections();
          void refetchProducts();
        }}
      />
    );
  }

  const collections = storeCollections ?? initialCollections;
  const products = storeProducts ?? initialProducts;
  const heroImage = SEED_IMAGES.shopHero ?? placeholderFor("square");

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen">
      <section className="relative overflow-hidden pt-24 pb-20">
        <div className="site-container">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="flex-1">
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("shop.atlas.eyebrow")}
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-[-0.03em] text-[var(--river-deep)]">
                  {t("shop.atlas.titlePrimary")} <br />
                  <span className="italic text-[var(--gold)]">
                    {t("shop.atlas.titleItalic")}
                  </span>
                </h1>
                <p className="mt-12 max-w-xl text-lg leading-relaxed text-[var(--muted)] handwritten">
                  {t("shop.atlas.lede")}
                </p>
              </Reveal>
            </div>

            <div className="w-full lg:w-1/3 relative">
              <Reveal delay={200}>
                <div className="relative aspect-square rotate-6 scrapbook-shadow bg-white p-4">
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                  <div className="absolute -top-4 -left-4 w-20 h-10 bg-[var(--gold)] flex items-center justify-center text-[var(--night)] font-bold text-xs -rotate-12 shadow-lg uppercase tracking-widest">
                    {t("shop.atlas.crafted")}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cinnabar)]">
            {t("shop.atlas.collectionsEyebrow")}
          </p>
          <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] md:text-4xl">
            {t("shop.atlas.collectionsTitle")}
          </h2>
        </Reveal>

        {collections.length === 0 ? (
          <div className="mt-10 scrapbook-shadow max-w-2xl rotate-1 border border-[var(--line)] bg-white/70 p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              {t("shop.atlas.collectionsEyebrow")}
            </p>
            <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("shop.atlas.empty.collections.title")}
            </h3>
            <p className="handwritten mt-4 text-lg leading-relaxed text-[var(--muted)]">
              {t("shop.atlas.empty.collections.body")}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, i) => {
              const cardImage = collection.image || placeholderFor("portrait");
              return (
                <Reveal key={collection.title} delay={i * 100}>
                  <Link href={collection.href} className="group block">
                    <article className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[var(--night)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(17,25,35,0.15)]">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
                        style={{ backgroundImage: `url(${cardImage})` }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,25,35,0.95),rgba(17,25,35,0.15)_60%,rgba(17,25,35,0))]" />
                      <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                          {collection.route}
                        </p>
                        <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-tight lg:text-4xl">
                          {collection.title}
                        </h3>
                        <p className="mt-5 text-sm leading-7 text-white/70 opacity-100 md:opacity-0 md:transition-opacity md:duration-500 md:group-hover:opacity-100">
                          {collection.body}
                        </p>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <section className="site-container py-12 lg:py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cinnabar)]">
              {t("shop.atlas.featuredEyebrow")}
            </p>
            <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] md:text-4xl">
              {t("shop.atlas.featuredTitle")}
            </h2>
          </div>
          <Link
            href="/shop/products"
            className="text-xs font-bold uppercase tracking-widest text-[var(--cinnabar)] transition-colors hover:text-[var(--cinnabar-deep)]"
          >
            {t("shop.atlas.viewAll")}
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="scrapbook-shadow max-w-2xl rotate-1 border border-[var(--line)] bg-white/70 p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
              {t("shop.atlas.featuredEyebrow")}
            </p>
            <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
              {t("shop.atlas.empty.products.title")}
            </h3>
            <p className="handwritten mt-4 text-lg leading-relaxed text-[var(--muted)]">
              {t("shop.atlas.empty.products.body")}
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product, i) => (
              <StoreProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--night)] px-8 py-16 text-center text-white lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.08),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  {t("shop.cta.eyebrow")}
                </p>
                <h2 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight md:text-5xl">
                  {t("shop.cta.title")}
                </h2>
                <div className="mt-8">
                  <Link
                    href="/shop/products"
                    className="inline-block bg-[var(--gold)] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--night)] transition-all hover:bg-white"
                  >
                    {t("shop.cta.button")}
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
