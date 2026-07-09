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
      return {
        id: profile.id,
        level: levelLabel,
        levelZh: levelLabel,
        name: profile.name,
        specialty: profile.focus,
        languages: profile.language,
        serviceCount: 40 + (profiles.length - index) * 12,
        image: profile.avatar || placeholderFor("portrait"),
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
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      <section className="relative overflow-hidden pt-20 pb-14 sm:pt-24 sm:pb-16 lg:min-h-[70vh] lg:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(185,138,70,0.1),transparent_40%)]" />

        <div className="site-container relative w-full">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="max-w-3xl lg:col-span-8">
              <Reveal>
                <div className="mb-8 flex items-center gap-4 sm:mb-12 sm:gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--line)] font-[family:var(--font-display)] text-xl italic text-[var(--gold)]">
                    L
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)]">
                    {locale === "zh"
                      ? "LingTour 口译 / 现场协作"
                      : "LingTour Interpreting / Field Coordination"}
                  </p>
                </div>

                <h1 className="mb-6 font-[family:var(--font-display)] text-[2.95rem] leading-[0.86] tracking-[-0.04em] sm:mb-10 sm:text-7xl md:mb-12 md:text-9xl lg:text-[11rem]">
                  {locale === "zh" ? "让这一天" : "Let the day"} <br />
                  <span className="italic text-[var(--cinnabar)]">
                    {locale === "zh" ? "说清楚。" : "Speak."}
                  </span>
                </h1>

                <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-2 md:gap-12">
                  <p className="handwritten text-base leading-relaxed text-[var(--muted)] sm:text-xl">
                    {t("interpreting.hero.subtitle")}
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
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
                      {locale === "zh" ? "查看类型" : "Choose a scene"}
                    </a>
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mx-auto mt-2 w-full max-w-[18rem] self-center sm:max-w-[20rem] lg:col-span-4 lg:max-w-none lg:self-center">
              <Reveal delay={240}>
                <div className="relative mx-auto aspect-[3/4] w-full overflow-hidden rotate-2 border-[0.5rem] border-white scrapbook-shadow sm:aspect-[4/5] sm:border-[0.9rem] lg:ml-auto lg:max-w-[20rem] lg:border-[12px]">
                  <div
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

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {serviceTypes.map((item, index) => (
            <Reveal key={item.id} delay={index * 100} className="h-full">
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

      <section className="site-container py-16 pb-28 lg:py-24">
        <Reveal>
          <div>
            <div className="mb-8 opacity-60">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                {locale === "zh" ? "组合参考价" : "Budget guide"}
              </p>
              <h2 className="mt-3 max-w-[20ch] font-[family:var(--font-display)] text-3xl leading-[1.04] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap">
                {locale === "zh"
                  ? "服务类型 x 口译等级。"
                  : "Service type x interpreter level."}
              </h2>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,236,0.98))] shadow-[0_20px_60px_rgba(17,25,35,0.08)]">
              <div>
                <div className="hidden grid-cols-[1.2fr_repeat(3,1fr)] border-b border-[var(--line)] bg-[var(--paper-deep)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] md:grid">
                  <div className="p-4">{locale === "zh" ? "类型" : "Type"}</div>
                  <div className="p-4 text-center">
                    {t("interpreting.levels.junior")}
                  </div>
                  <div className="p-4 text-center">
                    {t("interpreting.levels.mid")}
                  </div>
                  <div className="p-4 text-center">
                    {t("interpreting.levels.senior")}
                  </div>
                </div>
                {matrix.map((row) => (
                  <div
                    key={row.service}
                    className="grid grid-cols-1 border-t border-[var(--line)] text-sm text-[var(--muted)] transition hover:bg-white/60 md:grid-cols-[1.2fr_repeat(3,1fr)]"
                  >
                    <div className="flex items-center gap-3 p-4">
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--gold)]/15 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--gold)]">
                        {row.icon}
                      </span>
                      <div>
                        <p className="font-bold text-[var(--river-deep)]">
                          {row.service}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                          {row.note}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 px-4 pb-4 md:hidden">
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
                          <p className="mt-1 font-[family:var(--font-display)] text-xl text-[var(--river-deep)]">
                            {tier.value}
                          </p>
                        </div>
                      ))}
                    </div>
                    {[row.junior, row.mid, row.senior].map((price, i) => (
                      <div
                        key={`${row.service}-${i}`}
                        className="hidden place-items-center p-4 font-[family:var(--font-display)] text-xl text-[var(--river-deep)] md:grid"
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
            href: "#service-types",
            variant: "secondary",
          },
        ]}
      />
    </div>
  );
}
