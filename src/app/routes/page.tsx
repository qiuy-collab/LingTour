import Link from "next/link";
import { FavoriteButton } from "@/components/account/FavoriteButton";
import { EditorialIntro } from "@/components/ui/EditorialIntro";
import { Reveal } from "@/components/ui/Reveal";
import { storyRoutes } from "@/data/routes";

export default function RoutesPage() {
  return (
    <div>
      <section className="border-b border-[var(--line)] py-20 lg:py-28">
        <EditorialIntro
          eyebrow="Story routes"
          title="Routes are written as stories, not checklists."
          description="Each route has a cultural thread, a chapter sequence, and a practical itinerary. The same route labels on the homepage map lead here as detailed story journeys."
        />
      </section>

      <section className="site-container py-12 lg:py-24">
        <div className="grid gap-7">
          {storyRoutes.map((route, routeIndex) => (
            <Reveal key={route.slug} delay={routeIndex * 120}>
              <article
                className="lux-card grid overflow-hidden border border-[var(--line)] bg-[var(--paper)] lg:grid-cols-[0.72fr_1.28fr]"
              >
                <Link
                  href={`/routes/${route.slug}`}
                  className="image-sheen min-h-[18rem] bg-cover bg-center sm:min-h-[24rem]"
                  style={{ backgroundImage: `url(${route.image})` }}
                >
                  <div className="relative z-10 flex h-full min-h-[18rem] flex-col justify-between p-5 text-white sm:min-h-[24rem] sm:p-7">
                    <div>
                      <p className="text-label text-white/68">Route 0{routeIndex + 1}</p>
                      <h2 className="mt-5 max-w-md font-[family:var(--font-display)] text-4xl leading-tight sm:text-5xl">
                        {route.title}
                      </h2>
                    </div>
                    <div className="grid gap-2 text-sm text-white/78">
                      <p>{route.city}</p>
                      <p>
                        {route.duration} / {route.audience}
                      </p>
                    </div>
                  </div>
                </Link>

                <div className="p-6 lg:p-8">
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-[var(--river-deep)] px-3 py-1 text-xs text-white">{route.culture}</span>
                    <span className="border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">
                      {route.duration}
                    </span>
                    <span className="border border-[var(--line)] px-3 py-1 text-xs text-[var(--muted)]">
                      {route.audience}
                    </span>
                  </div>

                  <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--ink)]">{route.summary}</p>

                  <div className="mt-8 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
                    {route.chapters.map((chapter, chapterIndex) => (
                      <Reveal key={chapter.title} delay={chapterIndex * 70}>
                        <div className="bg-white p-5">
                          <p className="text-label text-[var(--cinnabar)]">{chapter.label}</p>
                          <h3 className="mt-3 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                            {chapter.title}
                          </h3>
                          <p className="mt-2 text-sm text-[var(--muted)]">{chapter.place}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/routes/${route.slug}`}
                      className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm text-white kinetic-link"
                    >
                      Read route details
                    </Link>
                    <FavoriteButton id={route.slug} type="route" title={route.title} />
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
