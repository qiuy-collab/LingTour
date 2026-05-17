"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchHomeData, fetchStoreProducts, fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { CultureGallery } from "@/components/home/CultureGallery";
import { GuangdongMapSection } from "@/components/home/GuangdongMapSection";
import { GuangdongEventCalendar } from "@/components/home/GuangdongEventCalendar";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightPanel } from "@/components/ui/SpotlightPanel";

function formatStorePrice(price: number, currency: string) {
  return `${currency} $${price.toFixed(2)}`;
}

const FALLBACK_PRODUCTS = [
  {
    slug: "camphorwood-tray",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=900&q=80",
    name: "Hand-carved Camphorwood Tray",
    tag: "Masterpiece",
    collection: "Chaozhou Heritage",
    price: 128,
    currency: "SGD",
  },
  {
    slug: "volcanic-soil-bowl",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82",
    name: "Volcanic Soil Tea Bowl",
    tag: "Handcrafted",
    collection: "Zhanjiang Coast",
    price: 32,
    currency: "SGD",
  },
  {
    slug: "lingnan-tea-set",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=82",
    name: "Lingnan Clay Tea Set",
    tag: "Artisan",
    collection: "Lingnan Pottery",
    price: 62,
    currency: "SGD",
  },
  {
    slug: "chaozhou-embroidery",
    image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=900&q=82",
    name: "Chaozhou Silk Embroidery",
    tag: "Heritage",
    collection: "Chaozhou Heritage",
    price: 88,
    currency: "SGD",
  },
];

export default function Home() {
  const { t, locale } = useLocale();

  const { data: homeData, loading: homeLoading } = useApiQuery(
    () => fetchHomeData(locale),
    [locale],
  );

  const { data: products } = useApiQuery(
    () => fetchStoreProducts(locale),
    [locale],
  );

  const { data: allRoutes } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
  );

  if (homeLoading) return <LoadingSpinner text="Preparing the journey..." />;
  if (!homeData) return <ErrorState message="Could not load home data" />;

  const {
    regionShowcase,
    cultureHighlights,
    testimonials,
    trustMetrics,
  } = homeData;

  const storeProducts = products ?? [];
  const storyRoutes = allRoutes ?? [];

  return (
    <div className="bg-[var(--background)]">
      {/* 1. HERO PILLAR */}
      <section className="relative min-h-[calc(100svh-73px)] overflow-hidden bg-[var(--night)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60 hero-zoom"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1800&q=82)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.96),rgba(17,25,35,0.7)_45%,rgba(17,25,35,0.2))]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(0deg,var(--background),transparent)]" />

        <div className="site-container relative flex min-h-[calc(100svh-73px)] flex-col justify-between py-12 md:py-16">
          <div className="max-w-4xl pt-12 lg:pt-24">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
                {t("home.hero.title")}
              </p>
              <h1 className="mt-8 max-w-[11ch] font-[family:var(--font-display)] text-[3.8rem] leading-[0.92] text-white sm:text-7xl md:text-8xl lg:text-[7.5rem]">
                Guangdong, deeply arranged.
              </h1>
              <p className="mt-10 max-w-2xl text-lg leading-relaxed text-white/70 md:text-xl md:leading-relaxed">
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/routes"
                  className="btn-primary kinetic-link min-w-[200px] px-8 py-5 text-center text-xs"
                >
                  {t("common.btn.explore")}
                </Link>
                <Link
                  href="/interpreting"
                  className="btn-outline min-w-[200px] px-8 py-5 text-center text-xs"
                >
                  {t("common.btn.bookNow")}
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="mt-16 flex flex-wrap gap-x-20 gap-y-10 border-t border-white/10 pt-10">
            {trustMetrics.map((item, idx) => (
              <Reveal key={item.label} delay={idx * 100}>
                <div className="group">
                  <p className="font-[family:var(--font-display)] text-5xl text-white transition-colors group-hover:text-[var(--gold)]">
                    {item.value}
                  </p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    {item.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-[var(--paper-deep)]">
        {/* 2. MAP PILLAR */}
        <GuangdongMapSection cities={regionShowcase} />

        {/* Divider */}
        <div className="site-container"><div className="h-px bg-[var(--line)]" /></div>

        {/* 3. CALENDAR & ROUTE PILLAR */}
        <GuangdongEventCalendar />

        {/* Divider */}
        <div className="site-container"><div className="h-px bg-[var(--line)]" /></div>

        {/* 4. SHOP PILLAR */}
        <section className="site-container py-16 lg:py-24">
          <div className="mb-8 opacity-60">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">
                {t("shop.page.title")}
              </p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                {t("home.shop.title")}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(storeProducts.length > 0 ? storeProducts : FALLBACK_PRODUCTS).slice(0, 4).map((product, idx) => (
              <Reveal key={product.slug} delay={idx * 100}>
                <Link href={`/checkout?product=${product.slug}`} className="group block">
                  <article className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)] shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[0_24px_70px_rgba(17,25,35,0.12)]">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0),rgba(17,25,35,0.05)_60%,rgba(17,25,35,0.85))]" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white sm:p-8">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                          {product.tag ?? (product as any).collection ?? "Lingnan Goods"}
                        </span>
                      </div>
                      <h3 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight sm:text-3xl">
                        {product.name}
                      </h3>
                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <p className="text-sm text-white/80">
                          {typeof product.collection === 'string' ? product.collection : ((product as any).collection ?? "")}
                        </p>
                        <p className="font-semibold">{formatStorePrice(product.price, product.currency)}</p>
                      </div>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="site-container"><div className="h-px bg-[var(--line)]" /></div>

        {/* 5. INTERPRETING PILLAR */}
        <section className="site-container py-16 lg:py-24">
          <div className="mb-8 opacity-60">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">
                {t("interpreting.page.title")}
              </p>
              <h2 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                {t("home.interpreting.title")}
              </h2>
            </Reveal>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div>
              <Reveal>
              <Link
                href="/interpreting"
                className="inline-flex items-center gap-2 bg-[var(--cinnabar)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[var(--river-deep)]"
              >
                {t("interpreting.cta.button")}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              </Reveal>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.slice(0, 2).map((item, index) => (
                <Reveal key={item.name} delay={index * 100}>
                  <div className="h-full rounded-xl border border-[var(--line)] bg-white p-6">
                    <p className="text-sm leading-7 text-[var(--muted)]">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--river-deep)]">
                      {item.name}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CULTURE CARDS */}
        <section className="site-container pb-16 lg:pb-24">
          <CultureGallery highlights={cultureHighlights} />
        </section>

        {/* FINAL CTA */}
        <section className="site-container pb-16 lg:pb-24">
          <div className="relative overflow-hidden bg-[var(--night)] px-8 py-20 text-white lg:px-20 lg:py-24">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=82')] bg-cover bg-fixed grayscale" />
            <div className="relative z-10 max-w-3xl">
              <div className="mb-8 opacity-60">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">{t("interpreting.page.title")}</p>
              </div>
              <Reveal>
                <h2 className="font-[family:var(--font-display)] text-3xl leading-[1.1] md:text-5xl">
                  {t("home.interpreting.title")}
                </h2>
                <div className="mt-10">
                  <Link href="/interpreting" className="btn-gold px-10 py-5 text-xs">
                    {t("interpreting.cta.button")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

