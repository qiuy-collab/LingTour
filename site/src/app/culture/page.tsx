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

  if (loading) return <LoadingSpinner text="Loading cities…" />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  if (!cityCultures) return null;

  return (
    <div>
      <section className="border-b border-white/10 bg-[var(--night)] text-white">
        <div className="site-container grid min-h-[30rem] items-center gap-8 py-12 md:min-h-[39rem] lg:grid-cols-[minmax(0,0.82fr)_minmax(22rem,0.48fr)] lg:gap-12 lg:py-24">
          <div>
            <p className="text-label text-white/52">City culture</p>
            <h1 className="mt-6 max-w-[9.8ch] font-[family:var(--font-display)] text-[3.4rem] leading-[0.94] text-white sm:text-[4rem] md:text-[6rem] lg:text-[6.75rem]">
              {locale === "zh" ? "广东，逐城探寻" : "Guangdong, city by city"}
            </h1>
          </div>

          <div className="max-w-xl border-l border-white/18 pl-5 md:pl-8">
            <p className="font-[family:var(--font-display)] text-xl leading-snug text-white/88 md:text-3xl">
              {locale === "zh"
                ? "每一条路线都始于一个地方，然后延伸到食物、仪式、手艺和风景。"
                : "Every route begins with a place, then opens into food, ritual, craft, and landscape."}
            </p>
            <p className="mt-6 text-base leading-8 text-white/64">
              {locale === "zh"
                ? "选择一个城市，阅读其旅程背后的文化层次——从邻里习俗到塑造每条路线的故事。"
                : "Choose a city to read the cultural layer behind its journeys, from neighborhood customs to the stories that shape each route."}
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-white/54">
              <span className="border border-white/14 px-3 py-2">{locale === "zh" ? "美食" : "Food"}</span>
              <span className="border border-white/14 px-3 py-2">{locale === "zh" ? "仪式" : "Ritual"}</span>
              <span className="border border-white/14 px-3 py-2">{locale === "zh" ? "手艺" : "Craft"}</span>
              <span className="border border-white/14 px-3 py-2">{locale === "zh" ? "路线笔记" : "Route notes"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-24">
        <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-4">
          {cityCultures.map((city, index) => (
            <Reveal key={city.slug} delay={index * 80}>
              <Link href={`/culture/${city.slug}`} className="group bg-[var(--paper)] lux-card">
                <div
                  className="image-sheen h-56 bg-cover bg-center"
                  style={{ backgroundImage: `url(${city.image})` }}
                />
                <div className="min-h-[19rem] p-6">
                  <p className="text-label text-[var(--cinnabar)]">{city.label}</p>
                  <h2 className="mt-4 font-[family:var(--font-display)] text-4xl text-[var(--river-deep)]">
                    {city.name}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{city.narrative}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {city.tags.map((tag) => (
                      <span key={tag} className="border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-8 text-sm font-medium text-[var(--cinnabar)] transition group-hover:translate-x-1">
                    {locale === "zh" ? `进入${city.name}` : `Enter ${city.name}`}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[var(--paper-deep)] py-24 lg:py-32">
        <div className="pointer-events-none absolute -right-24 top-1/2 hidden -translate-y-1/2 -rotate-90 select-none font-[family:var(--font-display)] text-[14rem] leading-none text-[var(--night)]/[0.03] lg:block">
          CONNECTION
        </div>

        <div className="site-container relative">
          <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:items-start lg:gap-24">
            <Reveal>
              <div className="sticky top-32">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                  {locale === "zh" ? "地图联动" : "Map connection"}
                </p>
                <h2 className="mt-8 font-[family:var(--font-display)] text-[3.2rem] leading-[0.95] text-[var(--river-deep)] md:text-[4.2rem]">
                  {locale === "zh" ? "城市文化是每条路线的背景层。" : "City culture is the background layer of every route."}
                </h2>
                <div className="mt-10 h-px w-20 bg-[var(--cinnabar)]/40" />
                <p className="mt-10 text-lg leading-relaxed text-[var(--muted)]">
                  {locale === "zh"
                    ? "每一层文化底色都决定了路线的节奏。从地方习俗到地理轮廓，这些都是支撑旅程的骨架。"
                    : "The cultural undertone of a city dictates the rhythm of its routes. From local customs to geographical contours, these form the skeleton of every journey."}
                </p>
              </div>
            </Reveal>

            <div className="grid gap-8 sm:grid-cols-2">
              {cityCultures.slice(0, 4).map((city, index) => (
                <Reveal key={city.slug} delay={index * 120}>
                  <Link
                    href={`/culture/${city.slug}`}
                    className={`group relative flex h-full flex-col border border-[var(--line)] bg-white p-8 transition-all duration-500 hover:border-[var(--cinnabar)]/30 hover:shadow-xl ${
                      index === 1 || index === 2 ? "lg:translate-y-12" : ""
                    }`}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
                      {city.name}
                    </p>
                    <h3 className="mt-6 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)]">
                      {city.sections[0]?.title}
                    </h3>
                    <p className="mt-5 flex-1 text-sm leading-relaxed text-[var(--muted)]">
                      {city.sections[0]?.body}
                    </p>
                    <div className="mt-8 flex items-center justify-between border-t border-[var(--line)] pt-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                        {locale === "zh" ? "查看关联路线" : "Explore related route"}
                      </span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
