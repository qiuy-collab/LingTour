"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Reveal } from "@/components/ui/Reveal";
import { EditorialIntro } from "@/components/ui/EditorialIntro";

export default function RoutesPage() {
  const { locale } = useLocale();
  const { data, loading, error, refetch } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
  );

  if (loading) return <LoadingSpinner text="Loading routes…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!data) return null;

  const storyRoutes = data;

  return (
    <div>
      <section className="border-b border-[var(--line)] py-20 lg:py-28">
        <EditorialIntro
          eyebrow="Story routes"
          title={locale === "zh" ? "路线不是清单，而是故事。" : "Routes are written as stories, not checklists."}
          description={locale === "zh"
            ? "每条路线都有一条文化主线、一个章节序列和一份实用行程。点击任意路线探索全貌。"
            : "Each route has a cultural thread, a chapter sequence, and a practical itinerary. Click any route to explore its full journey."}
        />
      </section>

      <section className="site-container py-12 lg:py-24">
        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          {storyRoutes.map((route, routeIndex) => (
            <Reveal key={route.slug} delay={routeIndex * 120}>
              <article className="group flex h-full flex-col border border-[var(--line)] bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(17,25,35,0.08)]">
                <Link
                  href={`/routes/${route.slug}`}
                  className="image-sheen relative aspect-[16/10] overflow-hidden"
                >
                  <div
                    className="h-full w-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundImage: `url(${route.image})` }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0),rgba(17,25,35,0.7))]" />
                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">Route 0{routeIndex + 1}</p>
                    <h2 className="mt-2 font-[family:var(--font-display)] text-3xl leading-tight text-white">
                      {route.title}
                    </h2>
                  </div>
                </Link>

                <div className="flex flex-1 flex-col p-8">
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                      {route.culture}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                      {route.duration}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                      {route.audience}
                    </span>
                  </div>

                  <p className="mt-6 text-sm leading-relaxed text-[var(--muted)] line-clamp-3">
                    {route.summary}
                  </p>

                  <div className="mt-8">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--ink)]">
                      {locale === "zh" ? "旅程亮点" : "Journey Highlights"}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {route.itinerary.slice(0, 3).map((item, i) => (
                        <div key={i} className="border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-[11px] text-[var(--muted)]">
                          {item.stop}
                        </div>
                      ))}
                      {route.itinerary.length > 3 && (
                        <div className="px-3 py-2 text-[11px] text-[var(--muted)] italic">
                          +{route.itinerary.length - 3} more...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[var(--line)] pt-8">
                    <Link
                      href={`/routes/${route.slug}`}
                      className="group/link flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--cinnabar)]"
                    >
                      <span>{locale === "zh" ? "探索路线" : "Explore route"}</span>
                      <span className="h-px w-8 bg-[var(--cinnabar)] transition-all group-hover/link:w-12" />
                    </Link>
                    <FavoriteButton
                      id={route.slug}
                      type="route"
                      title={route.title}
                    />
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
