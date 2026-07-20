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
import { Reveal } from "@/components/ui/Reveal";
import { placeholderFor } from "@/lib/placeholders";
import { SEED_IMAGES } from "@/lib/seed-images";
import type { StoryRoute } from "@/data/routes";
import type { StoreProduct } from "@/data/store";
import { HomeAtlasHero } from "@/components/home/HomeAtlasHero";
import { StoreProductCard } from "@/components/store/StoreProductCard";

interface HomeClientProps {
  initialHomeData: HomeData;
  initialProducts: StoreProduct[];
  initialRoutes: StoryRoute[];
  initialEvents: EventData[];
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
      <HomeAtlasHero
        image={heroImage}
        eyebrow={t("home.hero.eyebrow")}
        titleLine1={t("home.hero.headingLine1")}
        accent={t("home.hero.headingAccent")}
        titleLine3={t("home.hero.headingLine3")}
        body={t("home.hero.body")}
        primaryLabel={t("home.hero.primaryCta")}
        secondaryLabel={t("home.hero.secondaryCta")}
        tags={[
          t("home.hero.tag.storyRoutes"),
          t("home.hero.tag.cultureContext"),
          t("home.hero.tag.languageSupport"),
        ]}
        stats={heroStats}
      />

      <div className="relative z-10">
        <HomeVideoChapter video={hero.video} fallbackPoster={heroImage} />

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
        <section id="home-shop" className="site-container py-16 sm:py-20 lg:py-28">
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
            <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-8 md:mx-auto md:grid md:max-w-[69rem] md:grid-cols-2 md:gap-x-20 md:gap-y-20 md:overflow-visible md:px-0 md:pb-10 lg:gap-x-28 lg:pb-16">
              {storeProducts.slice(0, 6).map((product, idx) => (
                <div
                  key={product.slug}
                  className={`w-[82vw] max-w-[24rem] shrink-0 snap-start pb-2 sm:w-[64vw] md:w-auto md:max-w-none md:shrink md:snap-none md:pb-10 ${
                    idx >= 2 ? "md:hidden" : ""
                  } ${idx === 1 ? "md:pt-20 lg:pt-28" : ""}`}
                >
                  <StoreProductCard product={product} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] p-8 shadow-[0_16px_52px_rgba(17,25,35,0.07)] sm:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                {t("shop.page.title")}
              </p>
              <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                {t("home.shop.empty.title")}
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
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
        <section className="site-container py-16 sm:py-20 lg:py-28">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
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
                <div className="space-y-5 sm:space-y-7">
                  {testimonials
                    .slice(0, 2)
                    .map((item: { name: string; quote: string }) => (
                        <div key={item.name} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white/45 p-5 sm:p-6">
                          <p className="text-base leading-7 text-[var(--muted)] sm:text-lg">
                            {item.quote}
                          </p>
                          <p className="mt-4 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--river-deep)]">
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

            <div className="relative mx-auto w-full max-w-[32rem] self-center lg:col-span-7 lg:max-w-none">
              <Reveal delay={300}>
                <div className="group relative aspect-[6/5] overflow-hidden rounded-[var(--radius-xl)] border border-white/70 bg-[var(--night)] shadow-[0_28px_90px_rgba(17,25,35,0.18)] sm:aspect-[16/10]">
                  <img
                    src={interpretingImage}
                    alt="Professional interpreting service in Guangdong"
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-[1.035]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,18,24,0.04),rgba(8,18,24,0.62))]" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 text-white sm:p-8">
                    <div>
                      <p className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-white/60">
                        {interpretingLabel}
                      </p>
                      <p className="mt-2 max-w-[16ch] font-[family:var(--font-display)] text-2xl leading-none sm:text-3xl">
                        {t("home.interpreting.registry")}
                      </p>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 bg-white/10 text-lg backdrop-blur-md" aria-hidden>
                      →
                    </span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 6. CULTURE: THE GALLERY ARCHIVE */}
        <section id="home-culture" className="site-container pb-16 sm:pb-20 lg:pb-28">
          <div className="border-t border-black/5 pt-16 sm:pt-20 lg:pt-28">
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
        <section className="site-container pb-20 lg:pb-28">
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--river-deep)] px-6 py-16 text-white shadow-[0_28px_90px_rgba(17,25,35,0.2)] sm:px-8 sm:py-20 lg:px-24 lg:py-28">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-15 grayscale"
              style={{ backgroundImage: `url(${ctaImage})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,18,24,0.96),rgba(8,18,24,0.7)_58%,rgba(8,18,24,0.28))]" />
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
