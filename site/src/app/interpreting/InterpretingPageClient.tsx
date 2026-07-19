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
import { InterpretingCommandHero } from "@/components/interpreting/InterpretingCommandHero";

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
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      <InterpretingCommandHero
        image={cinematicImage}
        eyebrow={
          locale === "zh"
            ? "LingTour 口译 / 现场协作"
            : "LingTour Interpreting / Field Coordination"
        }
        title={locale === "zh" ? "广东" : "Guangdong"}
        accent={locale === "zh" ? "口译服务" : "Interpreter Services"}
        subtitle={t("interpreting.hero.subtitle")}
        primaryLabel={locale === "zh" ? "预约口译" : "Plan support"}
        secondaryLabel={locale === "zh" ? "服务类型" : "Service types"}
        serviceCount={serviceTypes.length}
        interpreterCount={showcaseProfiles.length}
        locale={locale}
      />

      <section id="service-types" className="site-container py-16 sm:py-20 lg:py-28">
        <div className="mb-8">
          <Reveal>
            <p className="lt-kicker">
              {t("interpreting.atlas.serviceScenes")}
            </p>
            <h2 className="mt-4 max-w-[16ch] font-[family:var(--font-display)] text-4xl leading-[0.98] tracking-[-0.04em] text-[var(--river-deep)] sm:text-5xl lg:text-6xl">
              {t("interpreting.atlas.chooseShape")}
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceTypes.map((item, index) => (
            <Reveal key={item.id} delay={index * 80} className="h-full">
              <article className="group flex h-full min-h-[34rem] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_16px_52px_rgba(17,25,35,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(17,25,35,0.14)]">
                <div className="relative aspect-[16/10] overflow-hidden bg-[var(--night)]">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-1000 group-hover:scale-[1.045]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(8,18,24,0.68))]" />
                  <span className="absolute left-4 top-4 rounded-full border border-white/42 bg-black/22 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    Mode {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/52">{t("interpreting.atlas.baseRate")}</p>
                      <p className="mt-1 font-[family:var(--font-display)] text-3xl">{item.duration}</p>
                    </div>
                    <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/52">{t("interpreting.atlas.perDispatch")}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <h3 className="font-[family:var(--font-display)] text-3xl leading-[0.98] tracking-[-0.035em] text-[var(--river-deep)] sm:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{item.subtitle}</p>
                  <p className="mt-5 line-clamp-4 text-sm leading-7 text-[var(--muted)]">{item.body}</p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {item.tags.map((serviceTag) => (
                      <span
                        key={serviceTag}
                        className="rounded-full border border-[var(--line)] bg-[var(--paper-deep)]/45 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--river-deep)]"
                      >
                        {serviceTag}
                      </span>
                    ))}
                  </div>

                  <a href="#interpreting-booking" className="lt-action lt-action-secondary mt-auto w-full">
                    {t("interpreting.atlas.requestDispatch")} <span aria-hidden>→</span>
                  </a>
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
                  ? "按服务与等级查看价格"
                  : "Rates by Service & Level"}
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
