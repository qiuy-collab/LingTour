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
import { ShopGalleryHero } from "@/components/store/ShopGalleryHero";

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
      <ShopGalleryHero
        image={heroImage}
        eyebrow={t("shop.atlas.eyebrow")}
        title={t("shop.atlas.titlePrimary")}
        accent={t("shop.atlas.titleItalic")}
        lede={t("shop.atlas.lede")}
        craftedLabel={t("shop.atlas.crafted")}
        collectionCount={collections.length}
        featured={products[0]}
      />

      <section id="shop-collections" className="site-container py-14 sm:py-20 lg:py-24">
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
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, i) => {
              const cardImage = collection.image || placeholderFor("portrait");
              return (
                <Reveal key={collection.title} delay={i * 80} className="h-full">
                  <Link href={collection.href} className="group block h-full">
                    <article className="flex h-full min-h-[31rem] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_16px_50px_rgba(17,25,35,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_26px_75px_rgba(17,25,35,0.13)]">
                      <div className="relative aspect-[16/11] overflow-hidden bg-[var(--paper)] sm:aspect-[4/3]">
                        <img
                          src={cardImage}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-1000 group-hover:scale-[1.045]"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(8,18,24,0.36))]" />
                        <span className="absolute left-4 top-4 rounded-full border border-white/42 bg-black/22 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                          {collection.route}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col p-6 sm:p-7">
                        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--cinnabar)]">
                          Collection {String(i + 1).padStart(2, "0")}
                        </p>
                        <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-[0.98] tracking-[-0.035em] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-4xl">
                          {collection.title}
                        </h3>
                        <p className="mt-4 line-clamp-3 text-sm leading-7 text-[var(--muted)]">
                          {collection.body}
                        </p>
                        <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-5">
                          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)]">
                            {t("common.btn.enter")}
                          </span>
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--river-deep)] text-white transition group-hover:translate-x-1 group-hover:bg-[var(--cinnabar)]">→</span>
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

      <section className="site-container py-14 sm:py-20 lg:py-24">
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

      <section className="pb-16 sm:pb-20 lg:pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--night)] px-8 py-16 text-center text-white shadow-[0_28px_90px_rgba(17,25,35,0.2)] lg:px-20 lg:py-24">
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
