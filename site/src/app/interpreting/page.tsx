"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { fetchRoutes, fetchCities } from "@/lib/api-data";
import { useApiQuery } from "@/lib/use-api-query";
import { EditorialIntro } from "@/components/ui/EditorialIntro";
import { Reveal } from "@/components/ui/Reveal";
import { ImageParallax } from "@/components/culture/ImageParallax";
import { MouseGlow } from "@/components/culture/MouseGlow";
import { SectionProgress } from "@/components/culture/SectionProgress";
import { InterpretingFaqAccordion } from "@/components/interpreting/InterpretingFaqAccordion";
import { StatsCounter } from "@/components/interpreting/StatsCounter";
import { BookingFlowLine } from "@/components/interpreting/BookingFlowLine";
import { InterpreterFlipCard } from "@/components/interpreting/InterpreterFlipCard";
import { InterpreterShowcase, type InterpreterProfile } from "@/components/interpreting/InterpreterShowcase";
import { MultiStepForm } from "@/components/interpreting/MultiStepForm";
import { MobileStickyActions } from "@/components/layout/MobileStickyActions";

const serviceModes = [
  {
    title: "City companion interpreting",
    price: "From RMB 680 / half day",
    bestFor: "Best for independent visitors",
    body: "English support for the practical side of travel: transport, ordering, ticketing, local etiquette — and the small explanations that turn confusion into confidence.",
    includes: ["English city support", "Restaurant and transit help", "Local etiquette notes"],
    accent: "light",
  },
  {
    title: "Story route guided support",
    price: "From RMB 1,280 / day",
    bestFor: "Best for route-based travel",
    body: "For visitors following a LingTour route. The interpreter manages the practical side of the day while keeping the cultural thread clear across every stop, meal, and neighbourhood.",
    includes: ["Route pacing", "Stop-by-stop storytelling", "Photo and menu help"],
    accent: "dark",
    featured: true,
  },
  {
    title: "Group and study visit",
    price: "Custom quote",
    bestFor: "Best for delegations and campus visits",
    body: "For universities, exchange groups, research visits, and cultural programmes. Prepared schedules, bilingual coordination, and one person who keeps the day on track.",
    includes: ["Pre-trip planning", "Group coordination", "Workshop and campus support"],
    accent: "light",
  },
] as const;

const matchingScenarios = [
  {
    title: "Food-first day",
    body: "Markets, seafood restaurants, menus, table customs. An interpreter who can explain what you're eating and why it matters here.",
  },
  {
    title: "Slow cultural walk",
    body: "Neighbourhood streets, architecture, local routines, tea, temple etiquette. Context that turns background scenery into something you can read.",
  },
  {
    title: "Study or delegation support",
    body: "Prepared schedules, venue coordination, introductions, check-ins, time control. Bilingual logistics for groups on a fixed timetable.",
  },
  {
    title: "Light practical support",
    body: "A shorter booking: station pickup, hotel check-in, restaurant ordering, or one key cultural stop. For when a full day is more than you need.",
  },
];

const interpreterProfiles = [
  {
    name: "Culture Route Lead",
    language: "English / Mandarin / Cantonese support",
    focus: "Guangdong city history, neighbourhood reading, food context, and keeping a route's story clear from the first stop to the last.",
    helps: ["Museum visits", "Historic streets", "Route pacing"],
  },
  {
    name: "Food & Local Life Host",
    language: "English / Mandarin support",
    focus: "Markets, ordering, tea etiquette, menu translation, snack streets. The small daily interactions most visitors cannot access alone.",
    helps: ["Menus", "Tea culture", "Market walks"],
  },
  {
    name: "Study Visit Coordinator",
    language: "English / Mandarin support",
    focus: "Student groups, company visits, workshops, timetable control. Bilingual coordination across several venues in one day.",
    helps: ["Schedules", "Check-ins", "Group movement"],
  },
];

const bookingSteps = [
  {
    step: "01",
    title: "Share the brief",
    body: "Tell us the city, date, group size, route interest, and whether the day is practical, cultural, or food-led.",
  },
  {
    step: "02",
    title: "We shape the support",
    body: "We confirm language needs, pace, mobility, meeting point, and how much explanation versus logistics you want.",
  },
  {
    step: "03",
    title: "Receive the plan",
    body: "You receive service scope, timing, route fit, and a clear working format for your day.",
  },
  {
    step: "04",
    title: "Travel with support",
    body: "On the day, the interpreter handles communication and keeps the cultural context clear from the first stop to the last.",
  },
];

const requestChecklist = [
  "Preferred city or route",
  "Travel date and time window",
  "Language and group size",
  "Food, history, daily-life, or study visit focus",
  "Any mobility or scheduling constraints",
];

const faqs = [
  {
    question: "Is this a tour guide service or an interpreting service?",
    answer:
      "It is cultural interpreting plus travel support. The focus is on clear communication, route pacing, local etiquette, food and venue navigation, and making the story of a place accessible to international visitors.",
  },
  {
    question: "Can I book only restaurant or transport support?",
    answer:
      "Yes. Not every visit needs a full-day route. Short support is available for food streets, hotel check-in, station transfer, or one key cultural stop when you only need local help for part of the day.",
  },
  {
    question: "Do I need to follow a LingTour route exactly?",
    answer:
      "No. The published routes are starting points. You can follow one closely, simplify it, combine ideas from several routes, or ask for support around your own schedule and interests.",
  },
  {
    question: "What makes this different from hiring a generic translator?",
    answer:
      "The value goes beyond language. It is local pacing, etiquette, route logic, food context, and knowing what matters culturally at each stop — so the day feels connected rather than improvised.",
  },
];

const progressSections = [
  { id: "interpreting-hero", label: "Overview" },
  { id: "interpreting-modes", label: "Modes" },
  { id: "interpreting-match", label: "Match" },
  { id: "interpreting-process", label: "Process" },
  { id: "interpreting-booking", label: "Booking" },
  { id: "interpreting-faq", label: "FAQ" },
];

const showcaseProfiles: InterpreterProfile[] = [
  {
    id: "guide-heritage",
    name: "Maya Chen",
    specialty: "History & Heritage",
    languages: "English / Cantonese / Mandarin",
    serviceCount: 120,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    needsPrefill: "I prefer a guide with heritage expertise — museum visits, historic streets, and architectural walks with cultural context.",
  },
  {
    id: "guide-food",
    name: "David Li",
    specialty: "Food & Local Life",
    languages: "English / Mandarin",
    serviceCount: 85,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    needsPrefill: "Food-led day — markets, seafood restaurants, tea etiquette, and the stories behind each dish.",
  },
  {
    id: "guide-coordinator",
    name: "Sophie Wang",
    specialty: "Study & Group Coordination",
    languages: "English / Mandarin / Japanese",
    serviceCount: 64,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    needsPrefill: "Group and study visit support — prepared schedules, venue coordination, bilingual logistics.",
  },
];

export default function InterpretingPage() {
  const { locale } = useLocale();

  const { data: routesData } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
  );
  const { data: citiesData } = useApiQuery(
    () => fetchCities(locale),
    [locale],
  );

  const [prefillNeeds, setPrefillNeeds] = useState<string | undefined>(undefined);

  const regionShowcase = (citiesData ?? []).map((c) => ({
    slug: c.slug,
    name: c.name,
    image: c.image,
  }));
  const storyRoutes = (routesData ?? []).map((r) => ({
    slug: r.slug,
    title: r.title,
    image: r.image,
  }));

const heroMetrics = [
  { value: regionShowcase.length, suffix: regionShowcase.length > 1 ? " cities" : " city", label: "live service template" },
  { value: 3, suffix: " modes", label: "from half-day to group support" },
  { value: 4, suffix: " languages", label: "with local context and etiquette" },
  { value: storyRoutes.length, suffix: storyRoutes.length > 1 ? " routes" : " route", label: "matched to culture and food stories" },
];

  const featuredRoute = storyRoutes[0];
  const featuredCity = regionShowcase[0];

  return (
    <div className="relative bg-[var(--background)]">
      <SectionProgress sections={progressSections} />

      <section
        id="interpreting-hero"
        className="relative overflow-hidden bg-[var(--night)] text-white"
      >
        <div className="hero-zoom absolute inset-0 bg-grain opacity-[0.08]" />
        <div className="drift-bg absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(185,138,70,0.18),transparent_28%),radial-gradient(circle_at_82%_24%,rgba(124,155,134,0.18),transparent_30%),linear-gradient(180deg,rgba(17,25,35,0.22),rgba(17,25,35,0.8))]" />

        <div className="site-container relative grid gap-10 py-20 lg:min-h-[82svh] lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-28">
          <Reveal>
            <div>
              <p className="text-label text-white/48">Interpreting service</p>
              <h1 className="mt-5 max-w-[12ch] font-[family:var(--font-display)] text-[3.2rem] leading-[0.98] sm:text-[4.2rem] lg:text-[5.5rem]">
                Local knowledge, in English, when you need it.
              </h1>
              <div className="mt-8 max-w-2xl border-l border-[var(--gold)]/40 pl-5 text-base leading-8 text-white/74 sm:pl-7 sm:text-lg">
                LingTour interpreting pairs practical travel help with cultural explanation: transport,
                menus, tickets, etiquette, route pacing, and the local story behind each stop.
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#booking"
                  className="btn-gold kinetic-link px-8 py-5 text-center text-xs"
                >
                  Start a booking request
                </a>
                <Link
                  href="/routes"
                  className="btn-outline px-8 py-5 text-center text-xs"
                >
                  Browse story routes
                </Link>
              </div>
              <div className="mt-14 max-w-4xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Operating across</p>
                <div className="mt-6 flex flex-wrap items-baseline gap-x-12 gap-y-8">
                  {heroMetrics.map((metric) => (
                    <div key={metric.label} className="group relative">
                      <div className="flex items-baseline gap-2">
                        <span className="font-[family:var(--font-display)] text-5xl text-white transition-colors group-hover:text-[var(--gold)]">
                          {metric.value}
                        </span>
                        <span className="text-sm font-medium tracking-wider text-white/40 uppercase">
                          {metric.suffix}
                        </span>
                      </div>
                      <p className="mt-2 max-w-[18ch] text-[11px] leading-relaxed tracking-widest text-white/30 uppercase">
                        {metric.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <MouseGlow color="rgba(197,160,57,0.12)" size={500} className="h-full">
              <div className="relative">
                {/* Decorative element */}
                <div className="absolute -left-8 -top-8 hidden h-32 w-32 border-l border-t border-[var(--gold)]/20 lg:block" />
                
                <div className="grid gap-6">
                  <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-[rgba(248,244,236,0.06)] p-3 backdrop-blur-sm lg:p-4">
                    <ImageParallax className="absolute inset-0" speed={0.15}>
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${featuredRoute?.image ?? featuredCity?.image})` }}
                      />
                    </ImageParallax>
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0),rgba(17,25,35,0.9))]" />
                    <div className="relative z-10 flex h-full flex-col justify-end p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/20" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Featured Context</span>
                      </div>
                      <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight">
                        {featuredRoute?.title}
                      </h2>
                      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
                        A seamless bridge between Lingnan history and your personal journey.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="relative overflow-hidden border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                      <div className="absolute -right-4 -top-4 h-16 w-16 rotate-45 bg-[var(--gold)]/5" />
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Capabilities</p>
                      <ul className="mt-6 space-y-3">
                        {["Menu Narrative", "Etiquette Guidance", "Transit Logic", "Contextual Pacing"].map((item) => (
                          <li key={item} className="flex items-center gap-3 text-xs tracking-wide text-white/80">
                            <span className="h-1 w-1 bg-[var(--gold)]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="relative border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Philosophy</p>
                      <p className="mt-6 font-[family:var(--font-display)] text-xl italic leading-snug text-white/90">
                        &ldquo;Not just translation, but the translation of a soul.&rdquo;
                      </p>
                      <p className="mt-4 text-xs leading-relaxed text-white/50 italic">
                        Smooth, clear, and culturally informed from stop to stop.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </MouseGlow>
          </Reveal>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] text-white/30">Scroll</span>
          <svg className="blink-arrow h-8 w-4" viewBox="0 0 12 28" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2">
            <line x1="6" y1="2" x2="6" y2="20" />
            <polyline points="1,14 6,24 11,14" fill="none" />
          </svg>
        </div>
      </section>

      <section id="interpreting-modes" className="site-container py-16 lg:py-24">
        <EditorialIntro
          eyebrow="Service modes"
          title="Choose the level of support your day actually needs."
          description={
            <>
              <p>
                Not every visitor needs a full guided route. Some need a cultural companion for half a
                day. Some need an interpreter who can carry a story route properly. Others need a
                bilingual coordinator for a group.
              </p>
            </>
          }
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {serviceModes.map((mode, index) => {
            const featured = "featured" in mode && mode.featured;
            const dark = mode.accent === "dark";

            return (
              <Reveal key={mode.title} delay={index * 100}>
                <MouseGlow
                  color={dark ? "rgba(197,160,57,0.12)" : "rgba(182,66,53,0.08)"}
                  size={420}
                >
                  <article
                    className={`spotlight-panel lux-card relative h-full overflow-hidden border p-7 ${
                      dark
                        ? "border-[var(--gold)]/30 bg-[var(--night)] text-white"
                        : "border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
                    }`}
                  >
                    {featured ? (
                      <span className="absolute right-5 top-5 border border-[var(--gold)]/40 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                        Recommended
                      </span>
                    ) : null}
                    <p className={`text-label ${dark ? "text-[var(--gold)]" : "text-[var(--cinnabar)]"}`}>
                      {mode.price}
                    </p>
                    <h3 className="mt-5 max-w-[12ch] font-[family:var(--font-display)] text-3xl leading-tight">
                      {mode.title}
                    </h3>
                    <p className={`mt-4 text-sm uppercase tracking-[0.16em] ${dark ? "text-white/44" : "text-[var(--muted)]"}`}>
                      {mode.bestFor}
                    </p>
                    <p className={`mt-5 text-sm leading-7 ${dark ? "text-white/72" : "text-[var(--muted)]"}`}>
                      {mode.body}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-2">
                      {mode.includes.map((item) => (
                        <span
                          key={item}
                          className={`px-3 py-2 text-[11px] uppercase tracking-[0.16em] ${
                            dark
                              ? "border border-white/10 bg-white/6 text-white/78"
                              : "border border-[var(--line)] bg-white text-[var(--ink)]"
                          }`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </article>
                </MouseGlow>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="interpreting-match" className="relative overflow-hidden bg-[var(--paper-deep)] py-20 lg:py-32">
        {/* Background decorative text */}
        <div className="pointer-events-none absolute -left-20 top-1/4 hidden -rotate-90 select-none font-[family:var(--font-display)] text-[12rem] leading-none text-[var(--night)]/[0.03] lg:block">
          MATCHING
        </div>

        <div className="site-container relative">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-24">
            <Reveal>
              <div className="sticky top-32">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">Service matching</p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-[3.5rem] leading-[0.95] text-[var(--river-deep)] md:text-[4.8rem]">
                  The right voice for the right day.
                </h2>
                <div className="mt-10 h-px w-24 bg-[var(--gold)]" />
                <p className="mt-10 text-lg leading-relaxed text-[var(--muted)]">
                  Interpreting works best when the day has a clear structure. Whether you start from a 
                  published route or a practical need, we match the language, pace, and cultural focus to it.
                </p>
                
                <div className="mt-16 hidden lg:block">
                  <div className="relative h-48 w-48 overflow-hidden rounded-full border border-[var(--gold)]/20 p-2">
                    <div className="h-full w-full rounded-full bg-[var(--night)] flex items-center justify-center p-8 text-center">
                      <p className="font-[family:var(--font-display)] text-sm italic leading-relaxed text-white/60">
                        &ldquo;Every street has a pulse; our job is to help you feel it.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            <div className="grid gap-8">
              <div className="grid gap-8 sm:grid-cols-2">
                {matchingScenarios.map((scenario, index) => (
                  <Reveal key={scenario.title} delay={index * 120}>
                    <article className={`group relative border border-[var(--line)] bg-[var(--paper)] p-8 transition-all duration-500 hover:border-[var(--gold)]/40 hover:shadow-[0_20px_50px_rgba(17,25,35,0.05)] ${index % 3 === 0 ? "sm:col-span-2 sm:py-12" : ""}`}>
                      <div className="flex items-start justify-between">
                        <span className="font-[family:var(--font-display)] text-5xl text-[var(--gold)]/20 transition-colors group-hover:text-[var(--gold)]/40">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="h-8 w-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--gold)]">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </div>
                      <h3 className={`mt-8 font-[family:var(--font-display)] text-[var(--river-deep)] ${index % 3 === 0 ? "text-4xl" : "text-2xl"}`}>
                        {scenario.title}
                      </h3>
                      <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">{scenario.body}</p>
                      
                      <div className="mt-8 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">Request this style</span>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>

              {/* Extra editorial section */}
              <Reveal delay={400}>
                <div className="relative mt-8 overflow-hidden bg-[var(--night)] p-10 text-white lg:p-16">
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-[url('https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-20" />
                  <div className="relative z-10 max-w-lg">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">The LingTour Standard</p>
                    <h3 className="mt-6 font-[family:var(--font-display)] text-4xl leading-tight">Beyond mere words.</h3>
                    <p className="mt-6 text-sm leading-loose text-white/60">
                      We don&apos;t just provide translators. We provide cultural bridges. Each member of our 
                      network is trained to recognize the nuance of a neighborhood, the history of a 
                      dish, and the specific practical needs of an international traveler.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Exploration Nodes section refactored for horizontal layout */}
      <section className="relative overflow-hidden bg-[var(--background)] py-24 lg:py-36">
        <div className="site-container">
          <Reveal>
            <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">Exploration Nodes</p>
                <h2 className="mt-6 font-[family:var(--font-display)] text-[3rem] leading-[1.05] text-[var(--river-deep)] md:text-[4rem]">
                  Start from a city, follow a story.
                </h2>
              </div>
              <Link href="/routes" className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                <span>View all cities</span>
                <span className="h-px w-12 bg-[var(--cinnabar)] transition-all group-hover:w-16" />
              </Link>
            </div>
          </Reveal>

          <div className="mt-24 grid gap-24">
            {/* Primary Route: Horizontal Layout */}
            <Reveal>
              <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="order-2 lg:order-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Featured Context</p>
                  <h3 className="mt-8 font-[family:var(--font-display)] text-5xl leading-tight text-[var(--river-deep)] lg:text-6xl">
                    {featuredRoute?.title}
                  </h3>
                  <div className="mt-10 h-0.5 w-16 bg-[var(--gold)]/30" />
                  <p className="mt-10 text-lg leading-relaxed text-[var(--muted)] max-w-xl">
                    Use an existing story route when you want the day to hold together from the first stop to the last meal. 
                    Our interpreters are trained to keep the cultural thread clear across every transition.
                  </p>
                  <div className="mt-12">
                    <Link
                      href={featuredRoute ? `/routes/${featuredRoute.slug}` : "/routes"}
                      className="btn-primary kinetic-link min-w-[240px] px-8 py-5 text-center text-xs"
                    >
                      Explore Route Support
                    </Link>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2 group relative aspect-[4/3] overflow-hidden border border-[var(--line)] bg-[var(--paper)] lg:aspect-[1/1.1]">
                  <ImageParallax className="absolute inset-0" speed={0.12}>
                    <div
                      className="h-full w-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url(${featuredRoute?.image ?? featuredCity?.image})` }}
                    />
                  </ImageParallax>
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0),rgba(17,25,35,0.4))]" />
                  {/* Floating label */}
                  <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 p-6 text-white max-w-[200px]">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Location</p>
                    <p className="mt-2 text-sm font-medium tracking-wide">{featuredCity?.name}</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* City Gateway & Stats: Secondary Block */}
            <div className="grid gap-16 lg:grid-cols-2 lg:items-start lg:gap-32">
              <Reveal delay={200}>
                <div>
                  <div className="border-l-2 border-[var(--gold)] pl-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">City Gateway</p>
                    <h3 className="mt-8 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)]">
                      {featuredCity?.name ?? "Zhanjiang"}
                    </h3>
                    <p className="mt-6 text-base leading-relaxed text-[var(--muted)] max-w-md">
                      Start from one city when you want slower, calmer support: transport, markets, one or two major stops, and room to improvise.
                    </p>
                  </div>
                  
                  <div className="mt-12 flex flex-wrap gap-4 pl-10">
                    {regionShowcase.map((city) => (
                      <Link
                        key={city.slug}
                        href={`/culture/${city.slug}`}
                        className="group relative overflow-hidden border border-[var(--line)] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--ink)] transition-all hover:border-[var(--gold)] hover:text-[var(--gold)]"
                      >
                        <span className="relative z-10">{city.name}</span>
                        <div className="absolute inset-0 translate-y-full bg-[var(--night)] transition-transform duration-300 group-hover:translate-y-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div className="space-y-12">
                  <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)]">
                    {[
                      { label: "Focus", value: "Cultural Narrative" },
                      { label: "Support", value: "Bilingual Logistics" },
                      { label: "Pacing", value: "Slow / Exploratory" },
                      { label: "Mode", value: "Half or Full Day" },
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-8">
                        <p className="text-[9px] uppercase tracking-widest text-[var(--muted)]">{item.label}</p>
                        <p className="mt-3 text-xs font-bold text-[var(--river-deep)] uppercase tracking-wider">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="relative overflow-hidden bg-[var(--night)] p-10 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">Good to know</p>
                    <p className="mt-6 text-sm leading-relaxed text-white/50">
                      Our network covers all cities in the LingTour system. We match guide expertise to your specific route interest.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Interpreter Showcase */}
      <InterpreterShowcase
        profiles={showcaseProfiles}
        onSelectGuide={(needsText) => setPrefillNeeds(needsText)}
      />

      <section id="interpreting-process" className="relative overflow-hidden bg-[var(--background)] py-20 lg:py-32">
        {/* Decorative background text */}
        <div className="pointer-events-none absolute right-0 top-0 hidden select-none font-[family:var(--font-display)] text-[20rem] leading-none text-[var(--gold)]/[0.03] lg:block">
          FLOW
        </div>

        <div className="site-container relative">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-24">
            <Reveal>
              <div className="sticky top-32">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">Operational Narrative</p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-[3.5rem] leading-[0.95] text-[var(--river-deep)] md:text-[4.8rem]">
                  From brief to being there.
                </h2>
                <div className="mt-12 h-px w-20 bg-[var(--gold)]" />
                <p className="mt-12 text-lg leading-relaxed text-[var(--muted)]">
                  Our process is built on clarity. We eliminate the guesswork of booking local support, 
                  replacing it with a structured, narrative-led approach to planning your days.
                </p>

                <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)]">
                  {[
                    { label: "Turnaround", value: "24-48 Hours" },
                    { label: "Format", value: "Tailored Plan" },
                  ].map((item) => (
                    <div key={item.label} className="bg-[var(--paper)] p-6">
                      <p className="text-[9px] uppercase tracking-widest text-[var(--muted)]">{item.label}</p>
                      <p className="mt-3 font-[family:var(--font-display)] text-xl text-[var(--river-deep)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <div className="relative">
              {/* Vertical timeline line decorative */}
              <div className="absolute -left-12 top-0 h-full w-px bg-gradient-to-b from-transparent via-[var(--line)] to-transparent lg:-left-20" />
              
              <div className="grid gap-12">
                {bookingSteps.map((step, index) => (
                  <Reveal key={step.step} delay={index * 120}>
                    <div className="group relative flex flex-col sm:flex-row sm:items-start gap-8">
                      <div className="relative flex shrink-0 items-center justify-center">
                        <div className="font-[family:var(--font-display)] text-7xl text-[var(--gold)]/10 transition-colors group-hover:text-[var(--gold)]/20 tabular-nums">
                          {step.step}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-[var(--line)] sm:border-t-0">
                        <h3 className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)] transition-transform group-hover:-translate-y-1">
                          {step.title}
                        </h3>
                        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] max-w-lg">
                          {step.body}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              {/* Interpreter profiles integration */}
              <Reveal delay={500}>
                <div className="mt-24 border border-[var(--line)] bg-[var(--night)] p-8 text-white sm:p-12">
                  <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">The Network</p>
                      <h3 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight">Archetypes of support.</h3>
                      <p className="mt-6 text-sm text-white/50 leading-relaxed">
                        Each guide is selected for a specific pulse of the city — from heritage narrative to the logistics of a group study visit.
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {interpreterProfiles.map((profile, idx) => (
                        <div key={profile.name} className="group border-b border-white/10 pb-4">
                          <p className="text-sm font-bold text-white transition-colors group-hover:text-[var(--gold)]">{profile.name}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-white/30">{profile.language}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section id="interpreting-booking" className="relative bg-[var(--night)] py-24 lg:py-36">
        <div className="absolute inset-0 bg-grain opacity-[0.05]" />
        
        <div className="site-container relative">
          <div className="grid gap-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-32">
            <Reveal>
              <div className="text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">Initiate request</p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-[3.2rem] leading-[0.95] md:text-[4.5rem]">
                  The start of your story.
                </h2>
                <p className="mt-10 text-lg leading-relaxed text-white/50 max-w-md">
                  Ready to add local context to your journey? Share your brief and our team will respond with a tailored support plan.
                </p>
                
                <div className="mt-16 space-y-8">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Essential Briefing Checklist</p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    {requestChecklist.map((item, index) => (
                      <Reveal key={item} delay={index * 100}>
                        <div className="flex items-start gap-4 group">
                          <div className="mt-1 h-5 w-5 shrink-0 rounded-full border border-white/10 flex items-center justify-center text-[var(--gold)] transition-colors group-hover:border-[var(--gold)]/40 group-hover:bg-white/5">
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                          <span className="text-xs uppercase tracking-widest text-white/60 leading-relaxed group-hover:text-white transition-colors">{item}</span>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>

                <div className="mt-20 border-t border-white/10 pt-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">What happens next</p>
                  <div className="mt-8 space-y-6">
                    {[
                      "We review language, pacing, and route fit.",
                      "We confirm the support scope that works for your day.",
                      "You receive a clear plan — not a vague quote.",
                    ].map((item, index) => (
                      <div key={item} className="flex gap-4">
                        <span className="font-[family:var(--font-display)] text-[var(--gold)]/40">{index + 1}</span>
                        <p className="text-sm text-white/60 leading-relaxed">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="relative">
                {/* Decorative bloom glow */}
                <div className="absolute -inset-20 bg-[var(--gold)]/10 blur-[120px] opacity-40 pointer-events-none" />
                <div id="booking" className="relative border border-white/10 bg-[rgba(255,255,255,0.02)] p-6 backdrop-blur-xl lg:p-12">
                  <div className="mb-10 flex items-center justify-between border-b border-white/10 pb-8">
                    <h3 className="font-[family:var(--font-display)] text-2xl text-white">Service Desk</h3>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-1 w-4 bg-[var(--gold)]/40" />
                      ))}
                    </div>
                  </div>
                  <MultiStepForm prefillNeeds={prefillNeeds} />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="interpreting-faq" className="relative py-24 lg:py-36">
        <div className="site-container">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-32">
            <Reveal>
              <div className="max-w-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">Inquiries</p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-[3rem] leading-[0.95] text-[var(--river-deep)] md:text-[4rem]">
                  The details of support.
                </h2>
                <p className="mt-10 text-base leading-relaxed text-[var(--muted)]">
                  The service should be clear before the day begins. These are the nuances of scope, 
                  expectations, and how we handle the unexpected.
                </p>
              </div>
            </Reveal>
            <div className="mt-4 lg:mt-0">
              <Reveal delay={150}>
                <InterpretingFaqAccordion items={faqs} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--night)] py-24 text-white lg:py-36">
        <div className="absolute inset-0 bg-grain opacity-[0.05]" />
        {/* Large decorative background text */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-[family:var(--font-display)] text-[30rem] leading-none text-white/[0.02]">
          LINGTOUR
        </div>
        
        <div className="site-container relative text-center">
          <Reveal>
            <div className="mx-auto max-w-4xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">Final call</p>
              <h2 className="mt-12 font-[family:var(--font-display)] text-[3.5rem] leading-[0.95] md:text-[5.5rem]">
                Interpret the meaning,<br />not just the words.
              </h2>
              <div className="mt-12 flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                <span>Flexible duration</span>
                <span className="h-1 w-1 rounded-full bg-[var(--gold)]/40 self-center" />
                <span>Route-aware support</span>
                <span className="h-1 w-1 rounded-full bg-[var(--gold)]/40 self-center" />
                <span>Cultural depth</span>
              </div>
              
              <div className="mt-20 flex flex-col items-center justify-center gap-6 sm:flex-row">
                <a href="#booking" className="btn-gold kinetic-link min-w-[220px] px-10 py-5 text-center text-xs">
                  Start your brief
                </a>
                <Link href="/routes" className="btn-outline min-w-[220px] px-10 py-5 text-center text-xs">
                  Browse routes first
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <MobileStickyActions
        actions={[
          { label: "Book Now", href: "#booking", variant: "primary" },
          { label: "Contact", href: "mailto:hello@lingtour.cn", variant: "secondary" },
        ]}
      />
    </div>
  );
}
