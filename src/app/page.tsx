import Link from "next/link";
import { GuangdongMapSection } from "@/components/home/GuangdongMapSection";
import {
  cultureHighlights,
  featuredRoutes,
  homeEntryCards,
  serviceSteps,
  testimonials,
  trustMetrics,
} from "@/data/home";

export default function Home() {
  return (
    <div>
      <section className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-[var(--night)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-72"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1800&q=82)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.94),rgba(17,25,35,0.55)_48%,rgba(17,25,35,0.18))]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(0deg,var(--background),transparent)]" />

        <div className="site-container relative flex min-h-[calc(100vh-73px)] flex-col justify-between py-12">
          <div className="max-w-4xl pt-10 lg:pt-20">
            <p className="text-label text-white/62">Guangdong cultural travel service</p>
            <h1 className="mt-5 font-[family:var(--font-display)] text-6xl leading-[0.98] text-white md:text-7xl lg:text-8xl">
              LingTour Guangdong
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
              Explore Guangdong through city stories, route narratives, cultural interpretation, and
              Lingnan-inspired objects designed for international visitors.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/routes"
                className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-[var(--cinnabar-deep)]"
              >
                Explore routes
              </Link>
              <Link
                href="/interpreting"
                className="border border-white/30 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-white hover:text-[var(--night)]"
              >
                Book interpreting
              </Link>
            </div>
          </div>

          <div className="grid gap-3 border-t border-white/14 pt-6 md:grid-cols-3">
            {trustMetrics.map((item) => (
              <div key={item.label}>
                <p className="font-[family:var(--font-display)] text-4xl">{item.value}</p>
                <p className="mt-1 text-label text-white/52">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Platform entrances</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Start from culture, route, service, or store.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
            The homepage works as a gateway: learn the culture, choose a story route, book language
            support, or browse products linked to Lingnan memory.
          </p>
        </div>

        <div className="mt-10 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 xl:grid-cols-4">
          {homeEntryCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group min-h-[17rem] bg-[var(--paper)] p-6 transition hover:bg-white"
            >
              <p className="text-label text-[var(--muted)]">{card.id}</p>
              <h3 className="mt-8 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                {card.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{card.body}</p>
              <p className="mt-8 text-sm font-medium text-[var(--cinnabar)] transition group-hover:translate-x-1">
                Enter
              </p>
            </Link>
          ))}
        </div>
      </section>

      <GuangdongMapSection />

      <section className="site-container py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-label text-[var(--cinnabar)]">Featured story routes</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Routes shaped like stories, not attraction lists.
            </h2>
          </div>
          <Link href="/routes" className="text-sm font-medium text-[var(--cinnabar)] hover:text-[var(--cinnabar-deep)]">
            View all routes
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {featuredRoutes.map((route) => (
            <article key={route.slug} className="border border-[var(--line)] bg-[var(--paper)] p-6">
              <p className="text-label text-[var(--gold)]">{route.theme}</p>
              <h3 className="mt-5 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
                {route.title}
              </h3>
              <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{route.description}</p>
              <div className="mt-8 flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                <span className="border border-[var(--line)] bg-white px-3 py-1">{route.duration}</span>
                <span className="border border-[var(--line)] bg-white px-3 py-1">{route.audience}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[var(--river-deep)] py-16 text-white lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-label text-white/52">Lingnan culture</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight md:text-5xl">
              Three culture lines hold the platform together.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden bg-white/12 md:grid-cols-3">
            {cultureHighlights.map((item) => (
              <article key={item.slug} className="bg-[rgba(255,255,255,0.06)] p-6">
                <h3 className="font-[family:var(--font-display)] text-3xl">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/68">{item.body}</p>
                <Link href="/culture" className="mt-7 inline-block text-sm text-white hover:text-white/72">
                  Read culture notes
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Interpreting service</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Practical support, carried by cultural context.
            </h2>
            <Link
              href="/interpreting"
              className="mt-8 inline-block bg-[var(--river-deep)] px-6 py-4 text-sm font-medium text-white transition hover:bg-[var(--night)]"
            >
              Start booking
            </Link>
          </div>

          <div className="space-y-3">
            {serviceSteps.map((step) => (
              <article key={step.step} className="grid gap-4 border border-[var(--line)] bg-[var(--paper)] p-5 sm:grid-cols-[4rem_1fr]">
                <p className="font-[family:var(--font-display)] text-3xl text-[var(--cinnabar)]">{step.step}</p>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--ink)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper-deep)] py-16 lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Lingnan store</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Let the journey continue through objects.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
              The store should feel closer to a museum shop than a discount marketplace: fewer products,
              stronger stories, clearer cultural origin.
            </p>
            <Link href="/shop" className="mt-8 inline-block bg-[var(--cinnabar)] px-6 py-4 text-sm font-medium text-white">
              Enter store
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--line)]">
            {["Tea set", "Opera pattern", "City postcard", "Craft object"].map((item) => (
              <div key={item} className="aspect-square bg-[var(--paper)] p-5">
                <div className="flex h-full flex-col justify-between border border-[var(--line)] p-4">
                  <p className="text-label text-[var(--muted)]">Selected</p>
                  <p className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-label text-[var(--cinnabar)]">Visitor voices</p>
          <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
            Short proof that the story route idea lands.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <blockquote key={item.name} className="border-l-2 border-[var(--cinnabar)] bg-[var(--paper)] p-6">
              <p className="text-lg leading-8 text-[var(--ink)]">&quot;{item.quote}&quot;</p>
              <footer className="mt-5 text-sm text-[var(--muted)]">{item.name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="site-container pb-6">
        <div className="bg-[var(--night)] px-6 py-12 text-white lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-label text-white/48">Start your Guangdong story</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight md:text-5xl">
                Pick a city, follow a story, and book the support you need.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/routes" className="bg-white px-6 py-4 text-center text-sm font-medium text-[var(--night)]">
                View routes
              </Link>
              <Link
                href="/interpreting"
                className="border border-white/24 px-6 py-4 text-center text-sm font-medium text-white"
              >
                Book support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
