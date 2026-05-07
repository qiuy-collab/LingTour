import Link from "next/link";
import { cityCultures } from "@/data/culture";

export default function CulturePage() {
  return (
    <div>
      <section className="border-b border-[var(--line)] bg-[var(--night)] py-20 text-white lg:py-28">
        <div className="site-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-label text-white/52">City culture</p>
            <h1 className="mt-5 max-w-5xl font-[family:var(--font-display)] text-5xl leading-tight md:text-7xl">
              Read Guangdong city by city.
            </h1>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-white/70">
            Culture here is organized by region, because the homepage map is the first entrance.
            Choose a city to understand its food, rituals, craft, landscape, and related story route.
          </p>
        </div>
      </section>

      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2 lg:grid-cols-4">
          {cityCultures.map((city) => (
            <Link key={city.slug} href={`/culture/${city.slug}`} className="group bg-[var(--paper)]">
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
          ))}
        </div>
      </section>

      <section className="bg-[var(--paper-deep)] py-16 lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Map connection</p>
            <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              City culture is the background layer of every route.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
            {cityCultures.slice(0, 4).map((city) => (
              <Link key={city.slug} href={city.routeHref} className="bg-white p-6 transition hover:bg-[var(--paper)]">
                <p className="text-label text-[var(--muted)]">{city.name}</p>
                <h3 className="mt-3 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                  {city.sections[0]?.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{city.sections[0]?.body}</p>
                <p className="mt-5 text-sm text-[var(--cinnabar)]">Follow related route</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
