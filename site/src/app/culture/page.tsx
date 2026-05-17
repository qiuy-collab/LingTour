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
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen">
      <section className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-24">
        <div className="site-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 z-10">
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px w-12 bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    City Culture / The Atlas
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-[-0.04em] text-[var(--river-deep)]">
                  Read the <br />
                  <span className="italic text-[var(--gold)]">Province.</span>
                </h1>
                <p className="mt-12 max-w-xl text-lg leading-relaxed text-[var(--muted)] handwritten">
                  Each city carries a different Guangdong: a coastline, a dialect, a table, a craft memory, and a rhythm you only notice when you slow down.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-5 relative">
              <Reveal delay={200}>
                <div className="relative aspect-[4/5] rotate-2 scrapbook-shadow overflow-hidden rounded-sm border-8 border-white">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1200&q=82)",
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10" />
                  {/* Tape effect */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/40 backdrop-blur-sm -rotate-2 z-20" />
                </div>

                {/* Floating metadata */}
                <div className="absolute -bottom-6 -left-6 bg-white p-6 scrapbook-shadow -rotate-3 hidden md:block">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Archive No.</p>
                  <p className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] mt-1">GD-020-0755</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
