"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchStoreCollections, fetchStoreProducts } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { StoreProductCard } from "@/components/store/StoreProductCard";
import { ShopHero } from "@/components/store/ShopHero";
import { Reveal } from "@/components/ui/Reveal";

export default function ShopPage() {
  const { locale, t } = useLocale();

  const { data: storeCollections, loading: colsLoading, error: colsError } = useApiQuery(
    () => fetchStoreCollections(locale),
    [locale],
  );

  const { data: storeProducts, loading: prodLoading, error: prodError } = useApiQuery(
    () => fetchStoreProducts(locale),
    [locale],
  );

  if (colsLoading || prodLoading) return <LoadingSpinner text="Loading store…" />;
  if (colsError || prodError) return <ErrorState message={colsError || prodError || "Failed to load"} />;

  const collections = storeCollections ?? [];
  const products = storeProducts ?? [];

  const bundlePhilosophy = [
    {
      title: locale === "zh" ? "路线记忆套装" : "The Route Memory Kit",
      body: locale === "zh"
        ? "明信片套装、城市地图卡和触感器物，让旅程的故事在归来后依然鲜活。"
        : "Postcard sets, city map cards, and tactile objects that keep a route's story alive after the trip.",
    },
    {
      title: locale === "zh" ? "国际访客礼盒" : "International Guest Gifting",
      body: locale === "zh"
        ? "轻便而有故事的礼盒套装，适用于代表团、学生和珍惜文化内涵的访客。"
        : "Lightweight, story-rich gift packs for delegations, students, and guests who value context over clutter.",
    },
  ];

  return (
    <div className="bg-[var(--paper-deep)]">
      <ShopHero />

      <section className="site-container py-16 lg:py-28">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <Reveal>
            <p className="text-label text-[var(--cinnabar)]">
              {locale === "zh" ? "合集" : "Collections"}
            </p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] md:text-5xl lg:text-6xl">
              {locale === "zh" ? "按路线策划。" : "Curated by route."}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <Link
              href="/routes"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--cinnabar)]"
            >
              {locale === "zh" ? "先浏览故事路线" : "Browse story routes first"}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection, i) => (
            <Reveal key={collection.title} delay={i * 100}>
              <Link href={collection.href} className="group relative block aspect-[3/4] overflow-hidden bg-[var(--night)]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
                  style={{ backgroundImage: `url(${collection.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,25,35,0.95),rgba(17,25,35,0.2)_60%,rgba(17,25,35,0))]" />
                <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/50">{collection.route}</p>
                  <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-tight lg:text-4xl">
                    {collection.title}
                  </h3>
                  <p className="mt-5 text-sm leading-7 text-white/70 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {collection.body}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 lg:py-28">
        <div className="site-container">
          <div className="mb-16 grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <Reveal>
              <p className="text-label text-[var(--cinnabar)]">
                {locale === "zh" ? "货架" : "The Shelf"}
              </p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl text-[var(--river-deep)] md:text-5xl lg:text-6xl">
                {locale === "zh" ? "精选入门器物。" : "Featured <br /> Starter Objects."}
              </h2>
            </Reveal>
            <Reveal delay={150}>
              <p className="text-base leading-8 text-[var(--muted)]">
                {locale === "zh"
                  ? "为想要立即且有意义之物的访客精选。每件物品都经过文化分量和便携性考量。"
                  : "A shortlist for visitors who want something immediate and meaningful. Each object is selected for cultural weight and ease of transport."}
              </p>
              <Link href="/shop/products" className="mt-8 inline-block text-sm font-semibold text-[var(--cinnabar)] transition hover:text-[var(--cinnabar-deep)]">
                {locale === "zh" ? "查看全部产品 →" : "View full product directory →"}
              </Link>
            </Reveal>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product, i) => (
              <StoreProductCard key={product.slug} product={product} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <div>
              <p className="text-label text-[var(--gold)]">
                {locale === "zh" ? "理念" : "Philosophy"}
              </p>
              <h2 className="mt-6 font-[family:var(--font-display)] text-5xl leading-tight text-[var(--river-deep)] md:text-6xl">
                {locale === "zh" ? "旅程的触感记录。" : "Tactile records <br /> of the journey."}
              </h2>
              <div className="mt-12 space-y-10">
                {bundlePhilosophy.map((item) => (
                  <div key={item.title} className="max-w-md border-l border-[var(--line)] pl-6 transition-colors hover:border-[var(--cinnabar)]">
                    <h3 className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--night)] shadow-[0_32px_80px_rgba(17,25,35,0.1)]">
              <img
                src="https://images.unsplash.com/photo-1590736961918-011a63403781?auto=format&fit=crop&w=1200&q=82"
                alt="Indigo craft"
                className="h-full w-full object-cover grayscale transition duration-1000 hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(17,25,35,0.4),transparent)]" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
