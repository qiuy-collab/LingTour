import Link from "next/link";
import { cityCultures } from "@/data/culture";
import { Reveal } from "@/components/ui/Reveal";

export default function CulturePage() {
  return (
    <div>
      <section className="border-b border-white/10 bg-[var(--night)] text-white">
        <div className="site-container grid min-h-[30rem] items-center gap-8 py-12 md:min-h-[39rem] lg:grid-cols-[minmax(0,0.82fr)_minmax(22rem,0.48fr)] lg:gap-12 lg:py-24">
          <div>
            <p className="text-label text-white/52">City culture</p>
            <h1 className="mt-6 max-w-[9.8ch] font-[family:var(--font-display)] text-[3.4rem] leading-[0.94] text-white sm:text-[4rem] md:text-[6rem] lg:text-[6.75rem]">
              Guangdong, city by city
            </h1>
          </div>

          <div className="max-w-xl border-l border-white/18 pl-5 md:pl-8">
            <p className="font-[family:var(--font-display)] text-xl leading-snug text-white/88 md:text-3xl">
              Every route begins with a place, then opens into food, ritual, craft, and landscape.
            </p>
            <p className="mt-6 text-base leading-8 text-white/64">
              Choose a city to read the cultural layer behind its journeys, from neighborhood customs
              to the stories that shape each route.
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em] text-white/54">
              <span className="border border-white/14 px-3 py-2">Food</span>
              <span className="border border-white/14 px-3 py-2">Ritual</span>
              <span className="border border-white/14 px-3 py-2">Craft</span>
              <span className="border border-white/14 px-3 py-2">Route notes</span>
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
                    Enter {city.name}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[var(--paper-deep)] py-16 lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <Reveal>
            <div>
              <p className="text-label text-[var(--cinnabar)]">Map connection</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                City culture is the background layer of every route.
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
            {cityCultures.slice(0, 4).map((city, index) => (
              <Reveal key={city.slug} delay={index * 100}>
                <Link href={city.routeHref} className="bg-white p-6 transition hover:bg-[var(--paper)] lux-card">
                  <p className="text-label text-[var(--muted)]">{city.name}</p>
                  <h3 className="mt-3 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                    {city.sections[0]?.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{city.sections[0]?.body}</p>
                  <p className="mt-5 text-sm text-[var(--cinnabar)]">Follow related route</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
