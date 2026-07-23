"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { fetchInterpreting, type InterpretingData } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import {
  InterpreterShowcase,
  type InterpreterProfile,
} from "@/components/interpreting/InterpreterShowcase";
import { BookingSection } from "@/components/interpreting/BookingSection";
import { MobileStickyActions } from "@/components/layout/MobileStickyActions";
import { SEED_IMAGES } from "@/lib/seed-images";
import { placeholderFor } from "@/lib/placeholders";
import { PastoralPageMotion } from "@/components/ui/PastoralPageMotion";

type ServiceType = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  duration: string;
  body: string;
  tags: string[];
};

type PricingTier = {
  service: string;
  icon: string;
  junior: string;
  mid: string;
  senior: string;
  note: string;
};

const clampCopy = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  const sliced = text.slice(0, maxLength).trim();
  const clean = sliced.replace(/[,:;.!?\-\s]+$/g, "");
  return `${clean}...`;
};

const serviceImagePool = [
  SEED_IMAGES.interpretingHero,
  SEED_IMAGES.interpretingShowcase,
  SEED_IMAGES.ambientLandscape,
];

const buildPricingMatrix = (t: (key: string) => string): PricingTier[] => [
  {
    service: t("interpreting.pricing.city"),
    icon: "CITY",
    junior: "¥680",
    mid: "¥980",
    senior: "¥1,480",
    note: t("interpreting.pricing.halfDay"),
  },
  {
    service: t("interpreting.pricing.route"),
    icon: "ROUTE",
    junior: "¥980",
    mid: "¥1,280",
    senior: "¥1,880",
    note: t("interpreting.pricing.fullDay"),
  },
  {
    service: t("interpreting.pricing.group"),
    icon: "GROUP",
    junior: "-",
    mid: "¥1,680",
    senior: "¥2,680+",
    note: t("interpreting.pricing.byGroup"),
  },
];

interface InterpretingPageClientProps {
  initialInterpretingData: InterpretingData;
}

export default function InterpretingPageClient({
  initialInterpretingData,
}: InterpretingPageClientProps) {
  const { t, locale } = useLocale();

  const {
    data: interpretingData,
    loading,
    error,
    refetch,
  } = useApiQuery(() => fetchInterpreting(locale), [locale], {
    initialData: initialInterpretingData,
  });

  const [prefillNeeds, setPrefillNeeds] = useState<string | undefined>(
    undefined,
  );
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  const handleSelectGuide = useCallback((needsText: string) => {
    setPrefillNeeds(needsText);
  }, []);

  const profileLevels = useMemo(
    () => [
      t("interpreting.levels.junior"),
      t("interpreting.levels.mid"),
      t("interpreting.levels.senior"),
    ],
    [t],
  );

  const effectiveInterpretingData = interpretingData ?? initialInterpretingData;

  const serviceTypes = useMemo<ServiceType[]>(() => {
    const modes = effectiveInterpretingData.serviceModes ?? [];
    return modes.map((mode, index) => ({
      id: mode.id,
      title: mode.title,
      subtitle: clampCopy(mode.bestFor, 40),
      image:
        serviceImagePool[index % serviceImagePool.length] ??
        placeholderFor("hero"),
      duration: mode.price,
      body: clampCopy(mode.body, 110),
      tags: mode.includes?.slice(0, 3) ?? [],
    }));
  }, [effectiveInterpretingData.serviceModes]);

  const showcaseProfiles = useMemo<InterpreterProfile[]>(() => {
    const profiles = effectiveInterpretingData.profiles ?? [];
    return profiles.map((profile, index) => {
      const levelLabel =
        profileLevels[Math.min(index, profileLevels.length - 1)];
      const profileAvatar =
        "avatar" in profile && typeof profile.avatar === "string"
          ? profile.avatar
          : undefined;
      return {
        id: profile.id,
        level: levelLabel,
        levelZh: levelLabel,
        name: profile.name,
        specialty: profile.focus,
        languages: profile.language,
        serviceCount: 40 + (profiles.length - index) * 12,
        image: profileAvatar || placeholderFor("portrait"),
        needsPrefill: profile.focus,
        rateLabel: effectiveInterpretingData.serviceModes?.[index]?.price,
        bestFor: profile.helps?.join(" / "),
      };
    });
  }, [
    effectiveInterpretingData.profiles,
    effectiveInterpretingData.serviceModes,
    profileLevels,
  ]);

  if (loading && initialInterpretingData.serviceModes.length === 0) {
    return <LoadingSpinner text="Setting up the interpreting desk..." />;
  }

  if (error && initialInterpretingData.serviceModes.length === 0) {
    return (
      <ErrorState
        title="Interpreting service unavailable"
        message="We can't load the interpreting catalogue right now. Please try again shortly."
        onRetry={refetch}
      />
    );
  }

  const matrix = buildPricingMatrix(t);
  const cinematicImage =
    SEED_IMAGES.interpretingShowcase ?? placeholderFor("portrait");

  return (
    <PastoralPageMotion
      className="min-h-screen bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)]"
      motionKey={`${serviceTypes.map((service) => service.id).join("|")}:${showcaseProfiles
        .map((profile) => profile.id)
        .join("|")}`}
    >
      <section className="relative overflow-hidden pb-16 pt-16 sm:pb-20 sm:pt-20 lg:min-h-[72vh] lg:pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(185,138,70,0.1),transparent_40%)]" />

        <div className="site-container relative w-full">
          <div className="grid grid-cols-[minmax(0,1.15fr)_minmax(8.5rem,0.85fr)] items-start gap-4 sm:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.75fr)] sm:gap-8 lg:grid-cols-12 lg:items-center lg:gap-10 xl:gap-16">
            <div className="min-w-0 max-w-4xl lg:col-span-7">
              <Reveal>
                <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4 lg:mb-10 lg:gap-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] font-[family:var(--font-display)] text-base italic text-[var(--gold)] sm:h-12 sm:w-12 sm:text-xl">
                    L
                  </div>
                  <p data-pastoral-kicker className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)]">
                    {locale === "zh"
                      ? "LingTour 口译 / 现场协作"
                      : "LingTour Interpreting / Field Coordination"}
                  </p>
                </div>

                <h1 className="mb-6 font-[family:var(--font-display)] text-[clamp(2.25rem,8.5vw,3.5rem)] leading-[0.88] tracking-[-0.045em] sm:mb-8 lg:text-[7rem] xl:text-[8.25rem]">
                  <span className="block overflow-hidden pb-1"><span data-pastoral-title className="block">{locale === "zh" ? "广东" : "Guangdong"}</span></span>
                  {locale === "zh" ? (
                    <span className="block overflow-hidden pb-3"><span data-pastoral-title className="block italic text-[var(--cinnabar)]">口译服务</span></span>
                  ) : (
                    <>
                      <span className="block overflow-hidden pb-1"><span data-pastoral-title className="block italic text-[var(--cinnabar)]">Interpreter</span></span>
                      <span className="block overflow-hidden pb-3"><span data-pastoral-title className="block italic text-[var(--cinnabar)]">Services</span></span>
                    </>
                  )}
                </h1>

                <div className="grid grid-cols-1 items-end gap-5 border-t border-[var(--line)] pt-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8 lg:pt-7">
                  <p data-pastoral-subtitle className="max-w-[34rem] handwritten text-[13px] leading-6 text-[var(--river-deep)]/70 sm:text-base sm:leading-relaxed lg:text-lg">
                    {t("interpreting.hero.subtitle")}
                  </p>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3 lg:gap-4">
                    <a
                      href="#interpreting-booking"
                      className="btn-primary inline-flex w-full items-center justify-center px-6 py-4 text-xs leading-none active:scale-95 sm:w-auto sm:px-10 sm:py-5"
                    >
                      {locale === "zh" ? "预约口译" : "Plan support"}
                    </a>
                    <a
                      href="#service-types"
                      className="btn-paper inline-flex w-full items-center justify-center px-6 py-4 text-xs leading-none sm:w-auto sm:px-10 sm:py-5"
                    >
                      {locale === "zh" ? "服务类型" : "Service types"}
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="w-full min-w-0 self-center lg:col-span-5 lg:max-w-none">
              <Reveal delay={240}>
                <div className="relative ml-auto aspect-[3/4] w-full overflow-hidden rotate-[1.5deg] border-[0.35rem] border-white scrapbook-shadow sm:border-[0.65rem] lg:aspect-[4/5] lg:max-w-[25rem] lg:border-[12px]">
                  <div
                    data-pastoral-hero-media
                    className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-1000 hover:grayscale-0 sm:scale-110"
                    style={{ backgroundImage: `url(${cinematicImage})` }}
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="service-types" className="site-container py-16 lg:py-24">
        <div className="mb-8 opacity-60">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
              {t("interpreting.atlas.serviceScenes")}
            </p>
            <h2 className="mt-3 max-w-[12ch] font-[family:var(--font-display)] text-3xl leading-[1.02] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap">
              {t("interpreting.atlas.chooseShape")}
            </h2>
          </Reveal>
        </div>

        <div className="scrollbar-hide -mx-4 mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-8 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:px-0">
          {serviceTypes.map((item, index) => (
            <Reveal key={item.id} delay={index * 100} className="h-full w-[82vw] max-w-[24rem] shrink-0 snap-start lg:w-auto lg:max-w-none lg:shrink lg:snap-none">
              <article
                className={`group relative flex h-full min-h-[380px] flex-col bg-white p-6 scrapbook-shadow transition-all duration-500 hover:-translate-y-2 sm:min-h-[420px] sm:p-8 ${
                  index % 2 === 0 ? "sm:rotate-1" : "sm:-rotate-1"
                }`}
              >
                <div className="absolute top-4 right-6 font-[family:var(--font-display)] text-8xl text-[var(--gold)]/10 select-none group-hover:text-[var(--gold)]/20 transition-colors">
                  0{index + 1}
                </div>

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 border-b border-[var(--line)] pb-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">
                      {t("interpreting.atlas.baseRate")}
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)]">
                        {item.duration}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-[var(--muted)]">
                        {t("interpreting.atlas.perDispatch")}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-2 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
                      {item.title}
                    </h3>
                    <p className="mb-6 text-xs font-bold uppercase tracking-widest text-[var(--gold)] italic">
                      {item.subtitle}
                    </p>
                    <p className="mb-8 handwritten text-sm leading-relaxed text-[var(--muted)]">
                      {item.body}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">
                      {t("interpreting.atlas.fieldCapabilities")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-sm border border-[var(--line)] bg-[var(--paper-deep)]/30 px-3 py-1 text-[10px] font-bold uppercase text-[var(--river-deep)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <a
                      href="#interpreting-booking"
                      className="btn-outline mt-6 block w-full py-4 text-center text-[10px] leading-none"
                    >
                      {t("interpreting.atlas.requestDispatch")}
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {showcaseProfiles.length ? (
        <InterpreterShowcase
          profiles={showcaseProfiles}
          onSelectGuide={handleSelectGuide}
          locale={locale}
        />
      ) : null}

      <section id="interpreting-pricing" className="site-container scroll-mt-24 py-16 pb-28 lg:py-24 lg:pb-32">
        <Reveal>
          <div>
            <div className="mb-10 grid gap-5 border-b border-[var(--line)] pb-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                {locale === "zh" ? "组合参考价" : "Budget guide"}
              </p>
              <h2 className="mt-4 max-w-[14ch] font-[family:var(--font-display)] text-4xl leading-[0.98] tracking-[-0.03em] text-[var(--river-deep)] sm:text-5xl md:max-w-none">
                {locale === "zh"
                  ? "按服务与等级查看价格"
                  : "Rates by Service & Level"}
              </h2>
              <p className="max-w-xs handwritten text-sm leading-6 text-[var(--muted)] sm:text-right">
                {locale === "zh" ? "现场场景为主线，按经验等级选择。" : "Choose the field format first, then the experience level that fits the day."}
              </p>
            </div>

            <div>
              <div className="space-y-4">
                <div className="hidden grid-cols-[1.2fr_repeat(3,1fr)] border-b border-[var(--line)] px-5 pb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] md:grid">
                  <div className="p-4">{locale === "zh" ? "类型" : "Type"}</div>
                  <div className="text-center">
                    {t("interpreting.levels.junior")}
                  </div>
                  <div className="text-center">
                    {t("interpreting.levels.mid")}
                  </div>
                  <div className="text-center">
                    {t("interpreting.levels.senior")}
                  </div>
                </div>
                {matrix.map((row, rowIndex) => (
                  <div
                    key={row.service}
                    className={`group grid grid-cols-1 border border-[var(--line)] bg-white/88 text-sm text-[var(--muted)] scrapbook-shadow transition-transform duration-500 hover:-translate-y-1 md:grid-cols-[1.2fr_repeat(3,1fr)] ${rowIndex === 1 ? "md:translate-x-3" : rowIndex === 2 ? "md:-translate-x-2" : ""}`}
                  >
                    <div className="flex items-center gap-4 p-5 sm:p-6">
                      <span className="grid h-11 w-11 shrink-0 place-items-center border border-[var(--gold)]/35 bg-[var(--paper)] text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--gold)] transition-colors group-hover:bg-[var(--gold)] group-hover:text-white">
                        {row.icon}
                      </span>
                      <div>
                        <p className="font-[family:var(--font-display)] text-2xl leading-none text-[var(--river-deep)]">
                          {row.service}
                        </p>
                        <p className="mt-2 text-[11px] leading-5 text-[var(--muted)]">
                          {row.note}
                        </p>
                      </div>
                    </div>
                    <div className="mx-5 grid grid-cols-3 gap-2 border-t border-[var(--line)] pb-5 pt-5 md:hidden">
                      {[
                        {
                          label: t("interpreting.levels.junior"),
                          value: row.junior,
                        },
                        { label: t("interpreting.levels.mid"), value: row.mid },
                        {
                          label: t("interpreting.levels.senior"),
                          value: row.senior,
                        },
                      ].map((tier) => (
                        <div key={tier.label} className="text-center">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">
                            {tier.label}
                          </p>
                          <p className="mt-2 font-[family:var(--font-display)] text-[1.3rem] leading-none text-[var(--river-deep)]">
                            {tier.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {[row.junior, row.mid, row.senior].map((price, i) => (
                      <div
                        key={`${row.service}-${i}`}
                        className="hidden place-items-center border-l border-[var(--line)] p-4 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] md:grid"
                      >
                        {price}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {effectiveInterpretingData.faqs.length ? (
        <section id="interpreting-faq" className="site-container scroll-mt-24 pb-24 lg:pb-32">
          <div className="grid gap-10 border-t border-[var(--line)] pt-12 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
            <Reveal>
              <div className="lg:sticky lg:top-28">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                  {locale === "zh" ? "服务答疑" : "Service notes"}
                </p>
                <h2 className="mt-4 max-w-[9ch] font-[family:var(--font-display)] text-4xl leading-[0.98] tracking-[-0.03em] text-[var(--river-deep)] sm:text-5xl">
                  {locale === "zh" ? "常见问题" : "Frequently asked questions"}
                </h2>
              </div>
            </Reveal>

            <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
              {effectiveInterpretingData.faqs.map((faq, index) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <Reveal key={faq.id} delay={Math.min(index * 55, 220)}>
                    <article>
                      <h3>
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-6 py-6 text-left sm:py-7"
                          aria-expanded={isOpen}
                          aria-controls={`faq-answer-${faq.id}`}
                          onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        >
                          <span className="font-[family:var(--font-display)] text-xl leading-snug text-[var(--river-deep)] sm:text-2xl">
                            {faq.question}
                          </span>
                          <span
                            aria-hidden="true"
                            className={`mt-1 grid h-8 w-8 shrink-0 place-items-center border border-[var(--line)] text-lg text-[var(--cinnabar)] transition-transform duration-300 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                          >
                            +
                          </span>
                        </button>
                      </h3>
                      <div
                        id={`faq-answer-${faq.id}`}
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="max-w-2xl pb-7 pr-10 handwritten text-sm leading-7 text-[var(--muted)] sm:text-base">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <BookingSection locale={locale} prefillNeeds={prefillNeeds} />

      <MobileStickyActions
        actions={[
          {
            label: locale === "zh" ? "预约" : "Book",
            href: "#interpreting-booking",
            variant: "primary",
          },
          {
            label: locale === "zh" ? "价格" : "Pricing",
            href: "#interpreting-pricing",
            variant: "secondary",
          },
        ]}
      />
    </PastoralPageMotion>
  );
}
