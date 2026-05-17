"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchCities } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { Reveal } from "@/components/ui/Reveal";

export default function CulturePage() {
  const { locale } = useLocale();
  const { data: cityCultures, loading, error, refetch } = useApiQuery(
    () => fetchCities(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Opening the city atlas..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!cityCultures) return null;

  return (
    <div className="bg-[var(--paper-deep)]">
      <section className="relative overflow-hidden bg-[var(--night)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45 hero-zoom"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1800&q=82)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.48),rgba(17,25,35,0.84))]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(0deg,var(--paper-deep),transparent)]" />

        <div className="site-container relative flex min-h-[46vh] flex-col justify-center py-20 lg:min-h-[56vh] lg:py-28">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
              City Culture
            </p>
            <h1 className="mt-6 max-w-[12ch] font-[family:var(--font-display)] text-[3.2rem] leading-[0.94] tracking-[-0.03em] sm:text-7xl md:text-8xl">
              Read the province through its cities.
            </h1>
            <div className="mt-8 h-px w-24 bg-[var(--gold)]/40" />
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/66">
              Each city carries a different Guangdong: a coastline, a dialect, a table, a craft memory, and a rhythm you only notice when you slow down.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="site-container -mt-12 py-12 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cityCultures.map((city, index) => (
            <Reveal key={city.slug} delay={index * 80}>
              <Link href={`/culture/${city.slug}`} className="group block">
                <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_24px_rgba(17,25,35,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(17,25,35,0.08)]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                      style={{ backgroundImage: `url(${city.image})` }}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,25,35,0.5),transparent_45%)]" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--gold)]">
                        {city.label}
                      </p>
                      <h2 className="mt-1 font-[family:var(--font-display)] text-3xl leading-tight text-white">
                        {city.name}
                      </h2>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
                      {city.narrative}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {city.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] text-[var(--muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-5 text-xs font-bold uppercase tracking-widest text-[var(--cinnabar)] transition-colors group-hover:text-[var(--cinnabar-deep)]">
                      <span>Enter {city.name}</span>
                      <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-16 lg:pb-24">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--night)] px-8 py-16 text-center text-white lg:px-20 lg:py-24">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(185,138,70,0.08),transparent_60%)]" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  Start with a thread
                </p>
                <h2 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight md:text-5xl">
                  The best journeys begin with one detail that refuses to leave you.
                </h2>
                <div className="mt-8">
                  <Link
                    href="/routes"
                    className="inline-block bg-[var(--gold)] px-10 py-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--night)] transition-all hover:bg-white"
                  >
                    Browse routes
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
