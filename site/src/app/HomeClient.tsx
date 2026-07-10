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
import { HomeEntryFilmstrip } from "@/components/home/HomeEntryFilmstrip";
import { HomeVideoChapter } from "@/components/home/HomeVideoChapter";
import { ShopProductImage } from "@/components/store/ShopProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";
import { formatCurrency } from "@/lib/region-currency";
import type { StoryRoute } from "@/data/routes";
import type { StoreProduct } from "@/data/store";

interface HomeClientProps {
  initialHomeData: HomeData;
  initialProducts: StoreProduct[];
  initialRoutes: StoryRoute[];
  initialEvents: EventData[];
}

function formatStorePrice(price: number, currency: string) {
  return formatCurrency(price, currency);
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

  const { hero, heroStats, homeEntryCards, regionShowcase, cultureHighlights, testimonials } =
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

  // Interpreting accent label (bottom-right of the field-notes block).
  const interpretingLabel =
    hero.interpretingLabel ?? t("home.interpreting.label");

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      {/* 1. HERO: THE MASTER REGISTRY */}
      <section className="relative overflow-hidden border-b border-[var(--gold)]/50 pb-14 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-16">
        <div className="site-container relative">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
            <div className="home-hero-bleed relative lg:col-span-7">
              <Reveal delay={100}>
                <figure>
                  <div className="group relative aspect-[16/11] w-full tape-effect sm:aspect-[3/2] lg:min-h-[40rem] lg:rotate-1">
                    <div className="absolute inset-0 overflow-hidden border-[0.5rem] border-white scrapbook-shadow sm:border-[0.8rem]">
                      <img
                        src={heroImage}
                        alt="Guangdong landscape showcasing cultural heritage and scenic beauty"
                        fetchPriority="high"
                        loading="eager"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                  </div>
                  <figcaption className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] lg:px-3">
                    {[
                      t("home.hero.tag.storyRoutes"),
                      t("home.hero.tag.cultureContext"),
                      t("home.hero.tag.languageSupport"),
                    ].map((label, index) => (
                      <span key={label} className="inline-flex items-center gap-4">
                        {index > 0 ? <span className="h-1 w-1 rounded-full bg-[var(--gold)]" /> : null}
                        {label}
                      </span>
                    ))}
                  </figcaption>
                </figure>
              </Reveal>
            </div>

            <div className="z-10 max-w-2xl lg:col-span-5 lg:pl-2">
              <Reveal delay={220}>
                <div className="mb-8 flex items-center gap-4 sm:mb-10">
                  <div className="w-12 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("home.hero.eyebrow")}
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-[clamp(3rem,6vw,6rem)] leading-[0.92] tracking-[-0.04em] text-[var(--river-deep)]">
                  {t("home.hero.headingLine1")} <br />
                  <span className="italic text-[var(--gold)]">{t("home.hero.headingAccent")}</span>{" "}
                  <br />
                  {t("home.hero.headingLine3")}
                </h1>
                <p className="handwritten mt-6 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:mt-10 sm:text-xl">
                  {t("home.hero.body")}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-4">
                  <Link
                    href="/interpreting"
                    className="btn-primary kinetic-link inline-flex min-w-0 w-full items-center justify-center px-6 py-4 text-xs shadow-[0_18px_40px_rgba(20,52,61,0.22)] sm:w-auto sm:min-w-[15rem] sm:px-10 sm:py-5"
                  >
                    <span className="relative z-10 text-white">
                      {t("home.hero.primaryCta")}
                    </span>
                  </Link>
                  <Link
                    href="/routes"
                    className="btn-paper inline-flex w-full items-center justify-center px-6 py-4 text-xs sm:w-auto sm:px-10 sm:py-5"
                  >
                    {t("home.hero.secondaryCta")}
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        {/* 1b. HERO STATS BAR — field-journal index, not SaaS metrics */}
        {heroStats.length > 0 && (
          <section className="site-container py-12 sm:py-16 lg:py-20">
            <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4">
              {heroStats.map((stat, idx) => (
                <Reveal key={idx} delay={idx * 100}>
                  <div className="group relative text-center lg:text-left">
                    <div className="mb-4 mx-auto w-8 h-px bg-[var(--gold)]/40 lg:mx-0" />
                    <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] sm:text-4xl lg:text-5xl">
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

        {hero.video?.url ? (
          <HomeVideoChapter video={hero.video} fallbackPoster={heroImage} />
        ) : null}

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
        <section className="site-container py-16 sm:py-20 lg:py-40">
          <div className="mb-10 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end md:gap-12">
            <div className="max-w-2xl">
              <Reveal>
                <div className="mb-5 flex items-center gap-4 md:mb-6">
                  <div className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("shop.page.title")}
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-[3.2rem] leading-[0.98] text-[var(--river-deep)] sm:text-5xl md:text-7xl">
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
            <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:gap-y-0">
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
                      className={`relative aspect-[16/11] scrapbook-shadow transition-all duration-700 group-hover:scale-[1.03] sm:aspect-[3/4] ${
                        idx % 2 === 0 ? "sm:rotate-2" : "sm:-rotate-2"
                      }`}
                    >
                      <ShopProductImage
                        src={product.image}
                        fallbackSrc={product.gallery?.[0]}
                        alt={product.name}
                        className="absolute inset-0 bg-[var(--paper)]"
                        imageClassName="object-cover object-center"
                      />
                      <div className="absolute inset-0 border-[0.75rem] border-white shadow-inner" />

                      {/* Price Tag Overlay */}
                      <div className="absolute bottom-3 right-3 z-20 bg-[var(--gold)] px-3 py-2 text-white shadow-lg sm:-bottom-4 sm:-right-4 sm:rotate-12 sm:px-4">
                        <p className="text-[10px] font-bold tracking-widest">
                          {formatStorePrice(product.price, product.currency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-2.5 sm:mt-10 sm:space-y-3">
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                        {product.tag ??
                          product.collection ??
                          t("home.shop.handpicked")}
                      </p>
                      <h3 className="font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-3xl">
                        {product.name}
                      </h3>
                        <p className="max-w-[20ch] text-sm text-[var(--muted)] handwritten">
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
        <section className="site-container py-16 sm:py-20 lg:py-40">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-20">
            <div className="max-w-2xl lg:col-span-5">
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("interpreting.page.title")}
                  </p>
                </div>
                <h2 className="mb-6 font-[family:var(--font-display)] text-[3.3rem] leading-[0.92] text-[var(--river-deep)] sm:mb-10 sm:text-6xl md:mb-12 md:text-7xl">
                  {t("home.interpreting.title")}
                </h2>
                <div className="space-y-6 sm:space-y-12">
                  {testimonials
                    .slice(0, 2)
                    .map((item: { name: string; quote: string }) => (
                        <div key={item.name} className="relative pl-12">
                          <div className="absolute left-0 top-0 font-[family:var(--font-display)] text-6xl text-[var(--gold)] opacity-20 italic">
                            “
                          </div>
                          <p className="handwritten mb-4 text-lg leading-relaxed text-[var(--muted)] italic sm:text-xl">
                            {item.quote}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">
                            — {item.name}
                          </p>
                        </div>
                      ),
                    )}
                </div>
                <div className="mt-10 sm:mt-16">
                  <Link
                    href="/interpreting"
                    className="btn-primary kinetic-link inline-flex w-full items-center justify-center gap-4 px-8 py-5 text-xs sm:w-auto sm:px-12"
                  >
                    <span className="relative z-10">{t("home.interpreting.cta")}</span>
                    <span aria-hidden className="relative z-10 text-base">→</span>
                  </Link>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
                    {t("home.interpreting.experts")}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="relative mx-auto w-full max-w-[24rem] self-center lg:col-span-7 lg:max-w-none">
              <Reveal delay={300}>
                <div className="group relative aspect-[6/5] overflow-hidden border-[0.5rem] border-white scrapbook-shadow sm:aspect-[16/10] sm:border-8 sm:rotate-1">
                  <img
                    src={interpretingImage}
                    alt="Professional interpreting service in Guangdong"
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover grayscale opacity-60 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100 sm:scale-105"
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
        <section className="site-container pb-16 sm:pb-20 lg:pb-40">
          <div className="border-t border-black/5 pt-16 sm:pt-20 lg:pt-40">
            <CultureGallery highlights={cultureHighlights} />
          </div>
        </section>

        {/* 7. ENTRY CARDS: QUICK ACCESS */}
        {homeEntryCards.length > 0 && (
          <>
            <div className="site-container">
              <div className="h-px bg-[var(--line)]" />
            </div>
            <section className="site-container py-20 lg:py-32">
              <HomeEntryFilmstrip cards={homeEntryCards} />
            </section>
          </>
        )}

        {/* FINAL CTA: THE DEPARTURE LOG */}
        <section className="site-container pb-20 lg:pb-40">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-6 py-16 text-white scrapbook-shadow sm:px-8 sm:py-20 lg:px-24 lg:py-32">
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
                <h2 className="mb-10 font-[family:var(--font-display)] text-4xl leading-[0.92] tracking-[-0.04em] sm:text-5xl md:mb-12 md:text-7xl lg:text-8xl">
                  {t("home.cta.title.primary")} <br />
                  <span className="italic text-[var(--gold)]">
                    {t("home.cta.title.italic")}
                  </span>
                </h2>
                <div className="mt-12 flex flex-wrap gap-4 sm:gap-6 md:mt-16">
                  <Link
                    href="/routes"
                    className="btn-gold inline-flex w-full items-center justify-center px-8 py-4 text-xs sm:w-auto sm:px-12 sm:py-5"
                  >
                    {t("home.cta.startLog")}
                  </Link>
                  <Link
                    href="/interpreting"
                    className="btn-ghost-dark inline-flex w-full items-center justify-center px-8 py-4 text-xs sm:w-auto sm:px-12 sm:py-5"
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
