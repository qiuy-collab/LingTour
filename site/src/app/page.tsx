"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchHomeData, fetchStoreProducts, fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { CultureGallery } from "@/components/home/CultureGallery";
import { FeaturedRoutesCarousel } from "@/components/home/FeaturedRoutesCarousel";
import { GuangdongMapSection } from "@/components/home/GuangdongMapSection";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightPanel } from "@/components/ui/SpotlightPanel";

function formatStorePrice(price: number, currency: string) {
  return `${currency} $${price.toFixed(2)}`;
}

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

  if (homeLoading) return <LoadingSpinner text="Loading…" />;
  if (!homeData) return <ErrorState message="Could not load home data" />;

  const {
    regionShowcase,
    cultureHighlights,
    testimonials,
    trustMetrics,
    homeEntryCards,
  } = homeData;

  const storeProducts = products ?? [];
  const storyRoutes = allRoutes ?? [];

  return (
    <div>
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
              <h1 className="mt-8 font-[family:var(--font-display)] text-[3.8rem] leading-[0.92] text-white sm:text-7xl md:text-8xl lg:text-[7.5rem]">
                LingTour<br />Guangdong
              </h1>
              <div className="mt-10 h-px w-24 bg-[var(--gold)]/50" />
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

      <section className="site-container py-12 lg:py-20">
        <div className="grid gap-8 border-l border-[var(--cinnabar)]/30 pl-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(22rem,0.58fr)] lg:items-start lg:pl-8">
          <div className="max-w-3xl">
            <p className="text-label text-[var(--cinnabar)]">{t("home.entryCards.0.title")}</p>
            <h2 className="mt-4 max-w-[16ch] font-[family:var(--font-display)] text-4xl leading-[1.1] text-[var(--river-deep)] md:text-[2.85rem]">
              {t("home.culture.subtitle")}
            </h2>
          </div>
          <p className="max-w-2xl pt-1 text-base leading-8 text-[var(--muted)] lg:pt-12">
            {t("home.entryCards.0.body")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {homeEntryCards.map((card, index) => (
            <Reveal key={card.href} delay={index * 90}>
              <Link href={card.href} className="group block">
                <SpotlightPanel className="lux-card min-h-[18rem] border border-[var(--line)] bg-[var(--paper)] p-6">
                  <p className="text-label text-[var(--muted)]">{card.id}</p>
                  <h3 className="mt-8 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] transition group-hover:translate-x-1 sm:text-3xl">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{card.body}</p>
                  <p className="mt-8 text-sm font-medium text-[var(--cinnabar)] transition group-hover:translate-x-2">
                    {t("common.btn.explore")}
                  </p>
                </SpotlightPanel>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <GuangdongMapSection cities={regionShowcase} />

      <FeaturedRoutesCarousel routes={storyRoutes} />
      <CultureGallery highlights={cultureHighlights} />

      <section className="site-container py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-label text-[var(--cinnabar)]">{t("interpreting.page.title")}</p>
            <h2 className="mt-4 max-w-[17ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              {t("home.interpreting.title")}
            </h2>
            <Link
              href="/interpreting"
              className="mt-8 inline-block bg-[var(--river-deep)] px-6 py-4 text-sm font-medium text-white transition hover:bg-[var(--night)]"
            >
              {t("interpreting.cta.button")}
            </Link>
          </div>

          <div className="grid gap-4">
            {[1, 2, 3, 4].map((num) => (
              <Reveal key={num} delay={(num - 1) * 80}>
                <SpotlightPanel className="lux-card grid gap-4 border border-[var(--line)] bg-[var(--paper)] p-5 sm:grid-cols-[4rem_1fr]">
                  <p className="font-[family:var(--font-display)] text-3xl text-[var(--cinnabar)]">0{num}</p>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{t(`interpreting.scenarios.${num - 1}.title`)}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{t(`interpreting.scenarios.${num - 1}.body`)}</p>
                  </div>
                </SpotlightPanel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper-deep)] py-16 lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-label text-[var(--cinnabar)]">{t("shop.page.title")}</p>
            <h2 className="mt-4 max-w-[18ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              {t("home.shop.title")}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
              {t("home.shop.subtitle")}
            </p>
            <Link href="/shop" className="kinetic-link mt-8 inline-block bg-[var(--cinnabar)] px-6 py-4 text-sm font-medium text-white">
              {t("home.shop.cta")}
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {storeProducts.slice(0, 4).map((product) => (
              <Link
                key={product.slug}
                href={`/checkout?product=${product.slug}`}
                className="group lux-card relative aspect-square overflow-hidden bg-[var(--night)] text-white shadow-[var(--shadow-soft)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-78 transition duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.08),rgba(17,25,35,0.82))]" />
                <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
                  <p className="text-label text-white/62">{product.tag}</p>
                  <h3 className="mt-2 font-[family:var(--font-display)] text-xl leading-tight sm:text-2xl">{product.name}</h3>
                  <p className="mt-2 translate-y-0 text-sm text-white/82 transition duration-300 md:translate-y-4 md:text-white/0 md:group-hover:translate-y-0 md:group-hover:text-white/82">
                    {formatStorePrice(product.price, product.currency)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-label text-[var(--cinnabar)]">{t("home.testimonials.0.name")}</p>
          <h2 className="mt-4 max-w-[18ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
            {t("home.entryCards.1.title")}
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 90}>
              <SpotlightPanel className="lux-card min-h-full border-l-2 border-[var(--cinnabar)] bg-[var(--paper)] p-6">
                <blockquote>
                  <p className="text-lg leading-8 text-[var(--ink)]">&ldquo;{item.quote}&rdquo;</p>
                  <footer className="mt-5 text-sm text-[var(--muted)]">{item.name}</footer>
                </blockquote>
              </SpotlightPanel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="site-container pb-6">
        <div className="bg-[var(--night)] px-6 py-12 text-white lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-label text-white/48">{t("home.hero.subtitle")}</p>
              <h2 className="mt-4 max-w-[20ch] font-[family:var(--font-display)] text-4xl leading-[1.12] md:text-[2.85rem]">
                {t("home.entryCards.2.title")}
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/routes" className="bg-white px-6 py-4 text-center text-sm font-semibold text-[#111923] shadow-sm transition hover:bg-[var(--paper-deep)]">
                {t("common.btn.learnMore")}
              </Link>
              <Link
                href="/interpreting"
                className="border border-white/24 px-6 py-4 text-center text-sm font-medium text-white"
              >
                {t("interpreting.cta.button")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
