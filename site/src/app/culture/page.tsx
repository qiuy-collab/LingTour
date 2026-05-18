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
        <div className="grid gap-x-12 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
          {cityCultures.map((city, index) => (
            <Reveal key={city.slug} delay={index * 80}>
              <Link href={`/culture/${city.slug}`} className="group block">
                <article className={`relative flex h-full flex-col transition-all duration-500 hover:-translate-y-3 ${
                  index % 3 === 0 ? "-rotate-1" : index % 3 === 1 ? "rotate-1" : "rotate-0"
                }`}>
                  <div className="relative aspect-[4/3] scrapbook-shadow border-[0.75rem] border-white overflow-hidden bg-white">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 filter contrast-[1.05] brightness-[0.95] sepia-[0.1]"
                      style={{ backgroundImage: `url(${city.image})` }}
                    />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/film-grain.png')] opacity-20 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-black/5" />

                    {/* Registry Tag */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-white/90 backdrop-blur-sm px-2 py-1 text-[7px] font-mono uppercase tracking-tighter text-[var(--river-deep)] border border-black/5 shadow-sm">
                        REG-0{index + 20}
                      </div>
                    </div>

                    {/* Tape decoration */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-10 bg-white/25 backdrop-blur-sm -rotate-3 z-20 border-x border-black/5" />
                  </div>

                  <div className="mt-8 relative px-4">
                    {/* Floating Post-it like element for label */}
                    <div className="absolute -top-12 -left-2 bg-[var(--gold)] text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest shadow-lg -rotate-3 z-20">
                      {city.label}
                    </div>

                    <h2 className="font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] group-hover:text-[var(--cinnabar)] transition-colors">
                      {city.name}
                    </h2>

                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--muted)] handwritten max-w-[25ch]">
                      {city.narrative}
                    </p>

                    <div className="pt-6 flex items-center justify-between border-t border-[var(--line)]/50 mt-4">
                      <div className="flex gap-3">
                        {city.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[8px] uppercase tracking-widest text-[var(--muted)]/40 font-bold">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                        <span className="relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[var(--cinnabar)] after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-left">Open Archive</span>
                        <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="pb-24 lg:pb-32">
        <div className="site-container">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-8 py-20 text-center text-white lg:px-20 lg:py-28 scrapbook-shadow">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=1800&q=82')] bg-cover bg-center grayscale" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <Reveal>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                  Start with a thread
                </p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-4xl leading-tight md:text-6xl">
                  The best journeys begin with one detail that refuses to leave you.
                </h2>
                <div className="mt-12">
                  <Link
                    href="/routes"
                    className="btn-gold inline-flex px-12 py-5 text-xs"
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
