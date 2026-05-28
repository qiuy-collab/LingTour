"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import {
  fetchEvents,
  fetchHomeData,
  fetchStoreProducts,
  fetchRoutes,
  type EventData,
} from "@/lib/api-data";
import type { HomeData } from "@/lib/server-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { CultureGallery } from "@/components/home/CultureGallery";
import { GuangdongMapSection } from "@/components/home/GuangdongMapSection";
import { GuangdongEventCalendar } from "@/components/home/GuangdongEventCalendar";
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";
import type { StoryRoute } from "@/data/routes";
import type { StoreProduct } from "@/data/store";

interface HomeClientProps {
  initialHomeData: HomeData;
  initialProducts: StoreProduct[];
  initialRoutes: StoryRoute[];
  initialEvents: EventData[];
}

function formatStorePrice(price: number, currency: string) {
  return `${currency} $${price.toFixed(2)}`;
}

export default function HomeClient({
  initialHomeData,
  initialProducts,
  initialRoutes,
  initialEvents,
}: HomeClientProps) {
  const { t, locale } = useLocale();

  // Server-fetched data is used as initialData.
  // When locale changes client-side, useApiQuery re-fetches in the background
  // (stale-while-revalidate). Content is visible immediately from SSR.
  const { data: homeData, loading: homeLoading } = useApiQuery(
    () => fetchHomeData(locale),
    [locale],
    { initialData: initialHomeData },
  );

  const { data: products } = useApiQuery(
    () => fetchStoreProducts(locale),
    [locale],
    { initialData: initialProducts },
  );

  const { data: allRoutes } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
    { initialData: initialRoutes },
  );

  const { data: events } = useApiQuery(
    () => fetchEvents(locale),
    [locale],
    { initialData: initialEvents },
  );

  // Only show loading spinner if we have NO initial data at all
  // (e.g., SSR failed AND client fetch is still pending).
  // In normal operation, initialHomeData is always available from SSR.
  if (homeLoading && !initialHomeData)
    return <LoadingSpinner text="Opening the field journal…" />;
  if (!homeData && !initialHomeData)
    return (
      <ErrorState
        title="Home stories unavailable"
        message="We can't reach the editorial archive right now. Please try again in a moment."
      />
    );

  // Use SSR data as fallback when client fetch hasn't returned yet
  const effectiveHomeData = homeData ?? initialHomeData;

  const { hero, heroStats, homeEntryCards, regionShowcase, cultureHighlights, testimonials, trustMetrics } =
    effectiveHomeData;

  const storeProducts = products ?? initialProducts;
  const storyRoutes = allRoutes ?? initialRoutes;
  const liveEvents = events ?? initialEvents;

  // Image priority: live CMS field → curated backend seed image → local Journal placeholder.
  // This way admin uploads will replace seed images automatically once available.
  const heroImage =
    hero.image ?? SEED_IMAGES.homeHero ?? placeholderFor("portrait");
  const ctaImage =
    hero.ctaImage ?? SEED_IMAGES.homeCta ?? placeholderFor("hero");
  const interpretingImage =
    hero.interpretingImage ??
    SEED_IMAGES.homeInterpreting ??
    placeholderFor("hero");

  // Hero badge: prefer explicit CMS badge, then derive from trust metrics, then a sane default.
  const heroBadge = hero.badge ??
    (trustMetrics[0]
      ? { value: trustMetrics[0].value, label: trustMetrics[0].label }
      : null);

  // Interpreting accent label (bottom-right of the field-notes block).
  const interpretingLabel =
    hero.interpretingLabel ?? t("home.interpreting.label");

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      {/* 1. HERO: THE MASTER REGISTRY */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-40 lg:pb-32">
        <div className="site-container relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 z-10">
              <Reveal>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("home.hero.title")}
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-5xl md:text-7xl lg:text-9xl xl:text-[10rem] leading-[0.82] tracking-[-0.05em] text-[var(--river-deep)]">
                  Guangdong, <br />
                  <span className="italic text-[var(--gold)]">Deeply</span>{" "}
                  <br />
                  Arranged.
                </h1>
                <p className="mt-12 max-w-xl text-xl leading-relaxed text-[var(--muted)] handwritten">
                  {t("home.hero.subtitle")}
                </p>
                <div className="mt-12 flex flex-wrap gap-4">
                  <Link
                    href="/routes"
                    className="btn-primary kinetic-link inline-flex min-w-0 w-full sm:w-auto sm:min-w-[15rem] items-center justify-center px-10 py-5 text-xs shadow-[0_18px_40px_rgba(20,52,61,0.22)]"
                  >
                    <span className="relative z-10 text-white">
                      {t("common.btn.explore")}
                    </span>
                  </Link>
                  <Link
                    href="/interpreting"
                    className="btn-paper inline-flex items-center justify-center px-10 py-5 text-xs w-full sm:w-auto"
                  >
                    {t("common.btn.bookNow")}
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5 relative mt-16 lg:mt-0">
              <Reveal delay={300}>
                <div className="relative aspect-[4/5] scrapbook-shadow rotate-3 border-[1rem] border-white overflow-hidden group">
                  <img
                    src={heroImage}
                    alt="Guangdong landscape showcasing cultural heritage and scenic beauty"
                    fetchPriority="high"
                    loading="eager"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  {/* Subtle ink wash, kept on both real and placeholder images */}
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Optional badge: editorial highlight from CMS or trust metric */}
                {heroBadge && heroBadge.value ? (
                  <div className="hidden md:block absolute -top-10 -right-6 w-32 h-32 rounded-full bg-[var(--gold)] flex flex-col items-center justify-center text-[var(--night)] shadow-2xl -rotate-12 border-4 border-white z-20">
                    <span className="font-[family:var(--font-display)] text-3xl leading-none">
                      {heroBadge.value}
                    </span>
                    <span className="text-[8px] font-bold uppercase tracking-widest mt-1 px-2 text-center">
                      {heroBadge.label}
                    </span>
                  </div>
                ) : null}

                {trustMetrics.length >= 2 ? (
                  <div className="absolute -bottom-8 -left-8 bg-white p-6 scrapbook-shadow -rotate-6 hidden md:block z-20">
                    <div className="flex gap-10">
                      {trustMetrics
                        .slice(0, 2)
                        .map((item: { label: string; value: string }) => (
                          <div key={item.label}>
                            <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                              {item.value}
                            </p>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">
                              {item.label}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        {/* 1b. HERO STATS BAR */}
        {heroStats.length > 0 && (
          <section className="site-container py-16 lg:py-20">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {heroStats.map((stat, idx) => (
                <Reveal key={idx} delay={idx * 100}>
                  <div className="text-center lg:text-left">
                    <p className="font-[family:var(--font-display)] text-4xl lg:text-5xl text-[var(--river-deep)]">
                      {stat.title}
                    </p>
                    <p className="mt-3 text-sm text-[var(--muted)] handwritten">
                      {stat.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        {/* 2. MAP PILLAR */}
        <GuangdongMapSection cities={regionShowcase} events={liveEvents} />

        {/* Divider */}
        <div className="site-container">
          <div className="h-px bg-[var(--line)]" />
        </div>

        {/* 3. CALENDAR & ROUTE PILLAR */}
        <GuangdongEventCalendar events={liveEvents} routes={storyRoutes} />

        {/* Divider */}
        <div className="site-container">
          <div className="h-px bg-[var(--line)]" />
        </div>

        {/* 4. SHOP: THE COLLECTOR'S SHELF */}
        <section className="site-container py-24 lg:py-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
            <div className="max-w-2xl">
              <Reveal>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("shop.page.title")}
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-5xl md:text-7xl leading-[0.95] text-[var(--river-deep)]">
                  {t("home.shop.title")}
                </h2>
              </Reveal>
            </div>
            <Link
              href="/shop"
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--river-deep)]"
            >
              <span>{t("home.shop.exploreCollection")}</span>
              <div className="w-10 h-px bg-[var(--river-deep)]/30 transition-all group-hover:w-16 group-hover:bg-[var(--cinnabar)]" />
            </Link>
          </div>

          {storeProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-y-0">
              {storeProducts.slice(0, 3).map((product, idx) => (
                <Reveal
                  key={product.slug}
                  delay={idx * 150}
                  className={`
                md:col-span-4
                ${idx === 0 ? "md:pr-12" : ""}
                ${idx === 1 ? "md:px-6 md:pt-24" : ""}
                ${idx === 2 ? "md:pl-12 md:pt-12" : ""}
              `}
                >
                  <Link
                    href={`/shop/products/${product.slug}`}
                    className="group block relative"
                  >
                    <div
                      className={`relative aspect-[3/4] scrapbook-shadow transition-all duration-700 group-hover:scale-[1.03] ${
                        idx % 2 === 0 ? "rotate-2" : "-rotate-2"
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 border-[0.75rem] border-white shadow-inner" />

                      {/* Price Tag Overlay */}
                      <div className="absolute -bottom-4 -right-4 bg-[var(--gold)] px-4 py-2 text-white shadow-lg rotate-12 z-20">
                        <p className="text-[10px] font-bold tracking-widest">
                          {formatStorePrice(product.price, product.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-10 space-y-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                        {product.tag ??
                          product.collection ??
                          t("home.shop.handpicked")}
                      </p>
                      <h3 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] group-hover:text-[var(--cinnabar)] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-sm text-[var(--muted)] handwritten max-w-[20ch]">
                        {product.collection ?? t("home.shop.localArchive")}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="scrapbook-shadow max-w-2xl rotate-1 border border-[var(--line)] bg-white/70 p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                {t("shop.page.title")}
              </p>
              <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                {t("home.shop.empty.title")}
              </h3>
              <p className="handwritten mt-4 text-lg leading-relaxed text-[var(--muted)]">
                {t("home.shop.empty.body")}
              </p>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="site-container">
          <div className="h-px bg-[var(--line)]" />
        </div>

        {/* 5. INTERPRETING: THE FIELD NOTES */}
        <section className="site-container py-24 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("interpreting.page.title")}
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-6xl md:text-7xl leading-[0.9] text-[var(--river-deep)] mb-12">
                  {t("home.interpreting.title")}
                </h2>
                <div className="space-y-12">
                  {testimonials
                    .slice(0, 2)
                    .map((item: { name: string; quote: string }) => (
                        <div key={item.name} className="relative pl-12">
                          <div className="absolute left-0 top-0 font-[family:var(--font-display)] text-6xl text-[var(--gold)] opacity-20 italic">
                            “
                          </div>
                          <p className="text-xl leading-relaxed text-[var(--muted)] handwritten italic mb-4">
                            {item.quote}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">
                            — {item.name}
                          </p>
                        </div>
                      ),
                    )}
                </div>
                <div className="mt-16">
                  <Link
                    href="/interpreting"
                    className="px-12 py-5 bg-[var(--river-deep)] text-white text-xs font-bold uppercase tracking-[0.2em] transition-transform hover:scale-105 inline-block"
                  >
                    {t("interpreting.cta.button")}
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7 relative">
              <Reveal delay={300}>
                <div className="relative aspect-[16/10] scrapbook-shadow rotate-1 border-8 border-white overflow-hidden group">
                  <img
                    src={interpretingImage}
                    alt="Professional interpreting service in Guangdong"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover grayscale opacity-60 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100 scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--river-deep)]/20 to-transparent" />

                  {/* Tape decoration */}
                  <div className="absolute top-0 right-1/4 w-12 h-24 bg-white/20 backdrop-blur-sm -rotate-6 z-20" />
                </div>

                {/* Floating Meta Tag */}
                <div className="hidden md:block absolute -bottom-10 right-10 bg-[var(--gold)] p-8 shadow-2xl -rotate-3 z-30">
                  <p className="text-white text-xs font-bold uppercase tracking-widest leading-none">
                    {interpretingLabel}
                  </p>
                  <p className="mt-3 font-[family:var(--font-display)] text-2xl text-white leading-tight">
                    {t("home.interpreting.registry")}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 6. CULTURE: THE GALLERY ARCHIVE */}
        <section className="site-container pb-24 lg:pb-40">
          <div className="border-t border-black/5 pt-24 lg:pt-40">
            <CultureGallery highlights={cultureHighlights} />
          </div>
        </section>

        {/* 7. ENTRY CARDS: QUICK ACCESS */}
        {homeEntryCards.length > 0 && (
          <>
            <div className="site-container">
              <div className="h-px bg-[var(--line)]" />
            </div>
            <section className="site-container py-24 lg:py-32">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {homeEntryCards.map((card, idx) => (
                  <Reveal key={card.id} delay={idx * 120}>
                    <Link
                      href={card.href}
                      className="group block relative bg-white/70 border border-[var(--line)] scrapbook-shadow hover:border-[var(--gold)]/50 transition-all duration-500 hover:-translate-y-1"
                    >
                      {card.image ? (
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.title}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      ) : null}
                      <div className="p-8">
                        <h3 className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] group-hover:text-[var(--cinnabar)] transition-colors">
                          {card.title}
                        </h3>
                        <p className="mt-3 text-sm text-[var(--muted)] handwritten leading-relaxed">
                          {card.body}
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                          <span>{t("common.btn.explore")}</span>
                          <div className="w-8 h-px bg-[var(--gold)] transition-all group-hover:w-12" />
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}

        {/* FINAL CTA: THE DEPARTURE LOG */}
        <section className="site-container pb-24 lg:pb-40">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-8 py-24 text-white lg:px-24 lg:py-32 scrapbook-shadow">
            <div
              className="absolute inset-0 opacity-10 bg-cover bg-center grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="relative z-10 max-w-4xl">
              <Reveal>
                <div className="mb-10 opacity-60">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
                    {t("home.cta.eyebrow")}
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-6xl md:text-8xl leading-[0.85] tracking-[-0.04em] mb-12">
                  {t("home.cta.title.primary")} <br />
                  <span className="italic text-[var(--gold)]">
                    {t("home.cta.title.italic")}
                  </span>
                </h2>
                <div className="flex flex-wrap gap-6 mt-16">
                  <Link
                    href="/routes"
                    className="btn-gold inline-flex items-center justify-center px-12 py-5 text-xs"
                  >
                    {t("home.cta.startLog")}
                  </Link>
                  <Link
                    href="/interpreting"
                    className="btn-ghost-dark inline-flex items-center justify-center px-12 py-5 text-xs"
                  >
                    {t("home.cta.bookCoordination")}
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
