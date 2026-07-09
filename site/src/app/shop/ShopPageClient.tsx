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
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="site-container">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
            <div className="max-w-3xl lg:col-span-8">
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("shop.atlas.eyebrow")}
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-[2.6rem] leading-[0.92] tracking-[-0.03em] text-[var(--river-deep)] sm:text-6xl md:text-8xl lg:text-9xl">
                  {t("shop.atlas.titlePrimary")} <br />
                  <span className="italic text-[var(--gold)]">
                    {t("shop.atlas.titleItalic")}
                  </span>
                </h1>
                <p className="handwritten mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:mt-12 sm:text-lg">
                  {t("shop.atlas.lede")}
                </p>
              </Reveal>
            </div>

            <div className="relative mx-auto mt-2 w-full max-w-[19rem] self-center sm:max-w-[22rem] lg:col-span-4 lg:mt-0 lg:max-w-none">
              <Reveal delay={200}>
                <div className="relative mx-auto aspect-[6/5] w-full bg-white p-2 scrapbook-shadow sm:aspect-square sm:p-4 sm:rotate-6 lg:ml-auto">
                  <div
                    className="h-full w-full bg-contain bg-center bg-no-repeat sm:bg-cover"
                    style={{ backgroundImage: `url(${heroImage})` }}
                  />
                  <div className="absolute -top-3 -left-3 flex h-9 w-16 items-center justify-center bg-[var(--gold)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--night)] shadow-lg sm:-top-4 sm:-left-4 sm:h-10 sm:w-20 sm:text-xs sm:-rotate-12 sm:tracking-widest">
                    {t("shop.atlas.crafted")}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-10 lg:py-20">
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
                    <article className="relative flex h-full flex-col transition-all duration-500 hover:-translate-y-2">
                      <div className="relative aspect-[16/10] overflow-hidden border-[0.7rem] border-white bg-white scrapbook-shadow sm:aspect-[3/4] sm:border-[0.9rem]">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-105"
                          style={{ backgroundImage: `url(${cardImage})` }}
                        />
                        <div className="absolute inset-0 bg-black/5" />
                        <div className="absolute left-4 top-4 bg-[var(--gold)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                          {collection.route}
                        </div>
                      </div>
                      <div className="mt-6 border border-[var(--line)] bg-white/72 p-6 scrapbook-shadow">
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                          {t("shop.atlas.collectionsEyebrow")}
                        </p>
                        <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)]">
                          {collection.title}
                        </h3>
                        <p className="mt-4 handwritten text-sm leading-7 text-[var(--muted)]">
                          {collection.body}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--river-deep)]">
                          <span>{t("common.btn.enter")}</span>
                          <div className="h-px w-8 bg-[var(--gold)] transition-all duration-300 group-hover:w-12" />
                        </div>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}
      </section>

      <section className="site-container py-10 lg:py-20">
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

      <section className="pb-20 lg:pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden bg-[var(--night)] px-8 py-16 text-center text-white scrapbook-shadow lg:px-20 lg:py-24">
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
