"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { fetchInterpreting } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";
import { InterpreterShowcase, type InterpreterProfile } from "@/components/interpreting/InterpreterShowcase";
import { BookingSection } from "@/components/interpreting/BookingSection";
import { MobileStickyActions } from "@/components/layout/MobileStickyActions";

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

const serviceImages = [
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=82",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=82",
];

const showcaseProfiles: InterpreterProfile[] = [
  {
    id: "junior-local",
    level: "Junior",
    levelZh: "\u521d\u7ea7",
    name: "Maya Chen \u9648\u7f8e\u96c5",
    specialty: "Everyday Support \u65e5\u5e38\u540c\u884c",
    languages: "English / Cantonese / Mandarin",
    serviceCount: 120,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=82",
    needsPrefill: "Junior interpreter for a relaxed day out: transport, ordering, shopping, and simple local explanation.",
    rateLabel: "$680 / half day",
    bestFor: "Best for easy city plans, meals, and casual errands.",
  },
  {
    id: "mid-cultural",
    level: "Mid-level",
    levelZh: "\u4e2d\u7ea7",
    name: "David Li \u674e\u5fb7\u4f1f",
    specialty: "Culture & Route \u6587\u5316\u8def\u7ebf",
    languages: "English / Mandarin",
    serviceCount: 85,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=82",
    needsPrefill: "Mid-level interpreter for route-based support: cultural context, food stories, pacing, and day-of coordination.",
    rateLabel: "$1,080 / day",
    bestFor: "Best for heritage routes, food trails, and paced storytelling.",
  },
  {
    id: "senior-coordinator",
    level: "Senior",
    levelZh: "\u9ad8\u7ea7",
    name: "Sophie Wang \u738b\u7d20\u83f2",
    specialty: "Business & Group \u5546\u52a1\u56e2\u4f53",
    languages: "English / Mandarin / Japanese",
    serviceCount: 64,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=82",
    needsPrefill: "Senior interpreter for business reception, study visits, bilingual briefings, and complex group coordination.",
    rateLabel: "$1,880 / day",
    bestFor: "Best for business hosts, delegations, and study visits.",
  },
];

const fallbackServiceTypes = (locale: "en" | "zh"): ServiceType[] => [
  {
    id: "city",
    title: locale === "zh" ? "\u57ce\u5e02\u540c\u884c" : "City Companion",
    subtitle: locale === "zh" ? "\u534a\u65e5\u6216\u4e00\u65e5\u8f7b\u966a\u540c" : "Half-day or day support",
    image: serviceImages[0],
    duration: locale === "zh" ? "4-8 \u5c0f\u65f6" : "4-8 hours",
    body:
      locale === "zh"
        ? "\u5904\u7406\u6253\u8f66\u3001\u70b9\u9910\u3001\u8d2d\u7269\u3001\u95ee\u8def\u548c\u57fa\u7840\u6c9f\u901a\uff0c\u8ba9\u65c5\u884c\u8fc7\u7a0b\u66f4\u987a\u3002"
        : "Transport, ordering, shopping, directions, and everyday communication handled with ease.",
    tags: locale === "zh" ? ["\u8f7b\u91cf", "\u7075\u6d3b", "\u751f\u6d3b\u573a\u666f"] : ["Easygoing", "Flexible", "Daily scenes"],
  },
  {
    id: "route",
    title: locale === "zh" ? "\u8def\u7ebf\u8bb2\u89e3" : "Route Interpreting",
    subtitle: locale === "zh" ? "\u6587\u5316\u8def\u7ebf\u4e2d\u7684\u6df1\u5ea6\u8bf4\u660e" : "Cultural route narration",
    image: serviceImages[1],
    duration: locale === "zh" ? "\u4e00\u65e5\u8def\u7ebf" : "Full-day route",
    body:
      locale === "zh"
        ? "\u8ddf\u7740 LingTour \u8def\u7ebf\u8d70\uff0c\u628a\u5efa\u7b51\u3001\u7f8e\u98df\u3001\u793c\u4eea\u548c\u5730\u65b9\u6545\u4e8b\u8bb2\u6e05\u695a\u3002"
        : "Follow a LingTour route with context for architecture, food, etiquette, and local stories.",
    tags: locale === "zh" ? ["\u6587\u5316", "\u8def\u7ebf", "\u6545\u4e8b"] : ["Culture", "Routes", "Stories"],
  },
  {
    id: "group",
    title: locale === "zh" ? "\u56e2\u4f53 / \u5546\u52a1" : "Group / Business",
    subtitle: locale === "zh" ? "\u4f1a\u8bae\u3001\u63a5\u5f85\u3001\u7814\u5b66\u4e0e\u56e2\u4f53\u79fb\u52a8" : "Meetings, reception, study visits",
    image: serviceImages[2],
    duration: locale === "zh" ? "\u5b9a\u5236\u65f6\u957f" : "Custom duration",
    body:
      locale === "zh"
        ? "\u9002\u5408\u56e2\u4f53\u63a5\u5f85\u3001\u5546\u52a1\u62dc\u8bbf\u3001\u7814\u5b66\u8003\u5bdf\uff0c\u5305\u542b\u6d41\u7a0b\u534f\u4f5c\u4e0e\u73b0\u573a\u6c9f\u901a\u3002"
        : "For group reception, business visits, and study programs with coordination support.",
    tags: locale === "zh" ? ["\u9ad8\u7ea7", "\u7edf\u7b79", "\u591a\u4eba"] : ["Senior-led", "Coordinated", "Groups"],
  },
];

const pricingMatrix = (locale: "en" | "zh"): PricingTier[] => [
  {
    service: locale === "zh" ? "\u57ce\u5e02\u540c\u884c" : "City",
    icon: "\u2197",
    junior: "$680",
    mid: "$980",
    senior: "$1,480",
    note: locale === "zh" ? "\u534a\u65e5\u53c2\u8003" : "Half-day ref.",
  },
  {
    service: locale === "zh" ? "\u8def\u7ebf\u8bb2\u89e3" : "Route",
    icon: "\u2301",
    junior: "$980",
    mid: "$1,280",
    senior: "$1,880",
    note: locale === "zh" ? "\u4e00\u65e5\u53c2\u8003" : "Full-day ref.",
  },
  {
    service: locale === "zh" ? "\u56e2\u4f53\u5546\u52a1" : "Group",
    icon: "\u25ce",
    junior: "-",
    mid: "$1,680",
    senior: "$2,680+",
    note: locale === "zh" ? "\u6309\u4eba\u6570\u6d6e\u52a8" : "By group size",
  },
];

export default function InterpretingPage() {
  const { locale } = useLocale();

  const { data: interpretingData, loading, error, refetch } = useApiQuery(
    () => fetchInterpreting(locale),
    [locale],
  );

  const [prefillNeeds, setPrefillNeeds] = useState<string | undefined>(undefined);

  const handleSelectGuide = useCallback((needsText: string) => {
    setPrefillNeeds(needsText);
  }, []);

  const serviceTypes = useMemo<ServiceType[]>(() => {
    const fallback = fallbackServiceTypes(locale);
    const modes = interpretingData?.serviceModes ?? [];
    if (!modes.length) return fallback;

    return fallback.map((item, index) => ({
      ...item,
      title: modes[index]?.title ?? item.title,
      body: clampCopy(modes[index]?.body ?? item.body, 112),
      subtitle: clampCopy(modes[index]?.bestFor ?? item.subtitle, 34),
      tags: modes[index]?.includes?.slice(0, 3) ?? item.tags,
      duration: modes[index]?.price ?? item.duration,
    }));
  }, [interpretingData?.serviceModes, locale]);

  if (loading) return <LoadingSpinner text="Preparing..." />;
  if (error) return <ErrorState message="Could not load interpreting data" onRetry={refetch} />;

  const matrix = pricingMatrix(locale);

  return (
    <div className="bg-[var(--paper-deep)] text-[var(--river-deep)]">
      <section className="relative min-h-[82vh] overflow-hidden bg-[var(--night)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center hero-zoom opacity-55"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2200&q=84)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.92),rgba(17,25,35,0.48),rgba(17,25,35,0.25))]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(0deg,var(--paper-deep),transparent)]" />

        <div className="site-container relative flex min-h-[82vh] items-end pb-20 pt-28">
          <Reveal>
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--gold)] backdrop-blur-md">
                {locale === "zh" ? "LingTour \u53e3\u8bd1\u670d\u52a1" : "LingTour Interpreting"}
              </p>
              <h1 className="mt-7 max-w-[11ch] font-[family:var(--font-display)] text-[3.5rem] leading-[0.94] tracking-[-0.03em] sm:text-7xl lg:text-8xl">
                {locale === "zh" ? "\u8ba9\u65c5\u9014\u542c\u5f97\u61c2\u3002" : "Let the day speak clearly."}
              </h1>
              <p className="mt-7 max-w-[36rem] text-[15px] leading-8 text-white/68 md:text-[17px] md:leading-[1.95]">
                {locale === "zh"
                  ? "\u628a\u8bed\u8a00\u3001\u8def\u7ebf\u3001\u793c\u4eea\u548c\u5730\u65b9\u6545\u4e8b\u5408\u5728\u4e00\u8d77\u3002\u5c11\u4e00\u70b9\u89e3\u91ca\u6210\u672c\uff0c\u591a\u4e00\u70b9\u771f\u6b63\u8fdb\u5165\u5f53\u5730\u7684\u4f53\u9a8c\u3002"
                  : "For markets, meetings, routes, and meals: a local interpreter who keeps language, timing, etiquette, and place moving as one."}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#interpreting-booking" className="rounded-full bg-[var(--gold)] px-6 py-3 text-sm font-bold text-[var(--night)] transition hover:-translate-y-0.5 hover:bg-white">
                  {locale === "zh" ? "\u9884\u7ea6\u53e3\u8bd1" : "Plan support"}
                </a>
                <a href="#service-types" className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15">
                  {locale === "zh" ? "\u67e5\u770b\u7c7b\u578b" : "Choose a scene"}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="service-types" className="site-container py-16 lg:py-24">
        <div className="mb-8 opacity-60">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
              {locale === "zh" ? "\u670d\u52a1\u7c7b\u578b" : "Service scenes"}
            </p>
            <h2 className="mt-3 max-w-[12ch] font-[family:var(--font-display)] text-3xl leading-[1.02] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap">
              {locale === "zh" ? "\u5148\u9009\u573a\u666f\u3002" : "Choose the shape of your day."}
            </h2>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {serviceTypes.map((item, index) => (
            <Reveal key={item.id} delay={index * 100} className="h-full">
              <article className="group relative flex h-full min-h-[380px] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,244,236,0.96))] p-6 text-[var(--river-deep)] shadow-[0_20px_60px_rgba(17,25,35,0.08)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(17,25,35,0.12)] sm:p-7">
                <div className="flex h-full flex-col">
                  <div className="flex min-h-[124px] items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)]">
                        {locale === "zh" ? "from USD" : "from USD"}
                      </p>
                      <p className="mt-3 min-h-[4.8rem] max-w-[8ch] font-[family:var(--font-display)] text-[2rem] leading-[0.95] tracking-[-0.03em] text-[var(--river-deep)]">
                        {item.duration}
                      </p>
                    </div>
                    <span className="font-[family:var(--font-display)] text-5xl leading-none text-[var(--cinnabar)]/18">0{index + 1}</span>
                  </div>

                  <div className="mt-6 min-h-[288px]">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {locale === "zh" ? "\u670d\u52a1\u4ecb\u7ecd" : "Service Profile"}
                    </p>
                    <h3 className="mt-3 min-h-[6.2rem] max-w-[11ch] text-balance font-[family:var(--font-display)] text-[2rem] leading-[1.02] tracking-[-0.025em] text-[var(--river-deep)]">{item.title}</h3>
                    <p className="mt-3 min-h-[2.75rem] text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--cinnabar)]/80">{item.subtitle}</p>
                    <p className="mt-4 min-h-[8.75rem] max-w-[30ch] text-[15px] leading-7 text-[var(--muted)]">{item.body}</p>
                  </div>

                  <div className="mt-6 min-h-[182px] rounded-[1.5rem] border border-[var(--line)] bg-white/72 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                      {locale === "zh" ? "\u9002\u5408\u573a\u666f" : "Best for"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[var(--paper-deep)] px-3 py-1 text-[11px] font-semibold text-[var(--river-deep)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="h-px bg-[var(--line)]" />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>


      <InterpreterShowcase
        profiles={showcaseProfiles}
        onSelectGuide={handleSelectGuide}
        locale={locale}
      />

      <section className="site-container py-16 lg:py-24">
        <Reveal>
          <div>
            <div className="mb-8 opacity-60">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                {locale === "zh" ? "\u7ec4\u5408\u53c2\u8003\u4ef7" : "Budget guide"}
              </p>
              <h2 className="mt-3 max-w-[20ch] font-[family:var(--font-display)] text-3xl leading-[1.04] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap">
                {locale === "zh" ? "\u670d\u52a1\u7c7b\u578b \u00d7 \u53e3\u8bd1\u7b49\u7ea7\u3002" : "Service type \u00d7 interpreter level."}
              </h2>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,244,236,0.98))] shadow-[0_20px_60px_rgba(17,25,35,0.08)]">
              <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-b border-[var(--line)] bg-[var(--paper-deep)] text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                <div className="p-4">{locale === "zh" ? "\u7c7b\u578b" : "Type"}</div>
                <div className="p-4 text-center">{locale === "zh" ? "\u521d\u7ea7" : "Junior"}</div>
                <div className="p-4 text-center">{locale === "zh" ? "\u4e2d\u7ea7" : "Mid"}</div>
                <div className="p-4 text-center">{locale === "zh" ? "\u9ad8\u7ea7" : "Senior"}</div>
              </div>
              {matrix.map((row) => (
                <div key={row.service} className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-t border-[var(--line)] text-sm text-[var(--muted)] transition hover:bg-white/60">
                  <div className="flex items-center gap-3 p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--gold)]/15 text-xl text-[var(--gold)]">{row.icon}</span>
                    <div>
                      <p className="font-bold text-[var(--river-deep)]">{row.service}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--muted)]">{row.note}</p>
                    </div>
                  </div>
                  {[row.junior, row.mid, row.senior].map((price, i) => (
                    <div key={`${row.service}-${i}`} className="grid place-items-center p-4 font-[family:var(--font-display)] text-xl text-[var(--river-deep)]">
                      {price}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <BookingSection locale={locale} prefillNeeds={prefillNeeds} />

      <MobileStickyActions
        actions={[
          { label: locale === "zh" ? "\u9884\u7ea6" : "Book", href: "#interpreting-booking", variant: "primary" },
          { label: locale === "zh" ? "\u4ef7\u683c" : "Pricing", href: "#service-types", variant: "secondary" },
        ]}
      />
    </div>
  );
}

