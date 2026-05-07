import Link from "next/link";
import { notFound } from "next/navigation";
import { cityCultures } from "@/data/culture";
import { getStoryRoute, storyRoutes } from "@/data/routes";

export function generateStaticParams() {
  return storyRoutes.map((route) => ({ slug: route.slug }));
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const route = getStoryRoute(slug);

  if (!route) {
    notFound();
  }

  const relatedCities = cityCultures.filter((city) => route.cities.includes(city.name));
  const routeStops = route.itinerary.map((item, index) => {
    const chapter = route.chapters[index] ?? route.chapters[route.chapters.length - 1];
    const cityMatch =
      relatedCities.find((city) => `${item.stop} ${chapter?.place ?? ""}`.includes(city.name)) ??
      relatedCities[index % Math.max(relatedCities.length, 1)];
    const image = item.image ?? cityMatch?.gallery[index % cityMatch.gallery.length] ?? cityMatch?.image ?? route.image;

    return {
      ...item,
      chapter,
      image,
    };
  });

  return (
    <div>
      <section
        className="relative overflow-hidden bg-[var(--night)] py-24 text-white lg:py-32"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(17,25,35,0.92), rgba(17,25,35,0.5)), url(${route.image})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="site-container relative">
          <p className="text-label text-white/58">{route.culture} story route</p>
          <h1 className="mt-5 max-w-5xl font-[family:var(--font-display)] text-5xl leading-tight md:text-7xl">
            {route.title}
          </h1>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/76">
            <span className="border border-white/24 bg-white/10 px-4 py-2">{route.city}</span>
            <span className="border border-white/24 bg-white/10 px-4 py-2">{route.duration}</span>
            <span className="border border-white/24 bg-white/10 px-4 py-2">{route.audience}</span>
          </div>
        </div>
      </section>

      <section className="site-container py-14 lg:py-20">
        <div className="mb-14 grid gap-8 border-b border-[var(--line)] pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Route axis</p>
            <h2 className="mt-4 max-w-xl font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
              Places in the center, story and schedule on both sides.
            </h2>
          </div>
          <div className="max-w-3xl">
            <p className="text-lg leading-9 text-[var(--muted)]">{route.story}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {relatedCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/culture/${city.slug}`}
                  className="border border-[var(--line)] bg-white px-4 py-2 text-sm transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
                >
                  {city.name} culture
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-5 top-0 hidden h-full w-px bg-[linear-gradient(180deg,transparent,var(--cinnabar),var(--river-deep),transparent)] md:left-1/2 md:block" />

          <div className="grid gap-16">
            {routeStops.map((stop, index) => (
              <article
                key={`${stop.time}-${stop.stop}`}
                className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_7rem_minmax(0,1fr)] md:items-center"
              >
                <div className="relative min-h-[31rem] overflow-hidden rounded-[2.2rem] bg-[var(--night)] text-white shadow-[0_28px_80px_rgba(17,25,35,0.18)]">
                  <div
                    className="absolute inset-x-0 bottom-0 h-[62%] bg-cover bg-center opacity-80"
                    style={{
                      backgroundImage: `url(${stop.image})`,
                      WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 34%, black 100%)",
                      maskImage: "linear-gradient(180deg, transparent 0%, black 34%, black 100%)",
                    }}
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(180deg,transparent,rgba(17,25,35,0.86))]"
                    aria-hidden="true"
                  />
                  <div className="relative z-10 flex min-h-[31rem] flex-col justify-start p-6 lg:p-8">
                    <p className="text-label text-white/62">Story line</p>
                    <h3 className="mt-4 max-w-xl font-[family:var(--font-display)] text-4xl leading-tight">
                      {stop.chapter?.title ?? stop.stop}
                    </h3>
                    <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">{stop.chapter?.story ?? stop.story}</p>
                  </div>
                </div>

                <div className="relative flex items-center justify-center md:block">
                  <div className="relative z-10 grid min-h-28 place-items-center bg-[var(--background)] px-3 text-center md:absolute md:left-1/2 md:top-1/2 md:w-28 md:-translate-x-1/2 md:-translate-y-1/2">
                    <div>
                      <p className="font-[family:var(--font-display)] text-5xl leading-none text-[var(--cinnabar)]">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <div className="mx-auto my-3 h-3 w-3 rounded-full bg-[var(--river-deep)] ring-4 ring-[var(--paper-deep)]" />
                      <p className="text-label text-[var(--muted)]">{stop.chapter?.label ?? "Stop"}</p>
                      <p className="mt-2 text-xs leading-5 text-[var(--ink)]">{stop.stop}</p>
                    </div>
                  </div>
                </div>

                <div className="relative min-h-[31rem] overflow-hidden rounded-[2.2rem] bg-[var(--paper)] shadow-[0_28px_80px_rgba(17,25,35,0.1)]">
                  <div
                    className="absolute inset-x-0 bottom-0 h-[58%] bg-cover bg-center opacity-28"
                    style={{
                      backgroundImage: `url(${stop.image})`,
                      WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 42%, black 100%)",
                      maskImage: "linear-gradient(180deg, transparent 0%, black 42%, black 100%)",
                    }}
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.88),transparent_42%),linear-gradient(180deg,rgba(248,244,236,0.98),rgba(248,244,236,0.9))]" />
                  <div className="relative z-10 flex min-h-[31rem] flex-col justify-between p-6 lg:p-8">
                    <div>
                      <p className="text-label text-[var(--cinnabar)]">{stop.time}</p>
                      <h3 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)]">
                        {stop.stop}
                      </h3>
                      <p className="mt-2 text-sm text-[var(--muted)]">{stop.chapter?.place}</p>
                    </div>
                    <div>
                      <p className="text-label text-[var(--muted)]">Itinerary detail</p>
                      <p className="mt-3 text-base leading-8 text-[var(--ink)]">{stop.plan}</p>
                      {stop.placeDetail ? (
                        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                          <span className="font-semibold text-[var(--ink)]">Where: </span>
                          {stop.placeDetail}
                        </p>
                      ) : null}
                      {stop.meal ? (
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                          <span className="font-semibold text-[var(--ink)]">Food: </span>
                          {stop.meal}
                        </p>
                      ) : null}
                      {stop.hotel ? (
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                          <span className="font-semibold text-[var(--ink)]">Hotel: </span>
                          {stop.hotel}
                        </p>
                      ) : null}
                      {stop.transit ? (
                        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                          <span className="font-semibold text-[var(--ink)]">Transit: </span>
                          {stop.transit}
                        </p>
                      ) : null}
                      <p className="mt-5 border-l-2 border-[var(--cinnabar)] pl-4 text-sm leading-7 text-[var(--muted)]">
                        {stop.story}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--paper-deep)] py-16 lg:py-20">
        <div className="site-container">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-label text-[var(--cinnabar)]">Next step</p>
              <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)]">
                Turn this story route into guided travel.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link href="/interpreting" className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm text-white">
                Book interpreting support
              </Link>
              <Link href="/routes" className="border border-[var(--line)] bg-[var(--paper)] px-6 py-4 text-center text-sm">
                Back to all routes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
