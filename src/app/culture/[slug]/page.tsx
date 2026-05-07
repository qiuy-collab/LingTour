import Link from "next/link";
import { notFound } from "next/navigation";
import { cityCultures, getCityCulture } from "@/data/culture";

export function generateStaticParams() {
  return cityCultures.map((city) => ({ slug: city.slug }));
}

export default async function CityCulturePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCityCulture(slug);

  if (!city) {
    notFound();
  }

  return (
    <div>
      <section
        className="relative overflow-hidden bg-[var(--night)] py-24 text-white lg:py-32"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(17,25,35,0.9), rgba(17,25,35,0.45)), url(${city.image})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="site-container relative">
          <p className="text-label text-white/58">{city.label}</p>
          <h1 className="mt-5 max-w-4xl font-[family:var(--font-display)] text-6xl leading-none md:text-8xl">
            {city.name}
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-8 text-white/76">{city.narrative}</p>
        </div>
      </section>

      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-8">
            <div className="border-l-2 border-[var(--cinnabar)] pl-6">
              <p className="text-label text-[var(--muted)]">Culture tags</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {city.tags.map((tag) => (
                  <span key={tag} className="border border-[var(--line)] bg-[var(--paper)] px-3 py-1 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="border border-[var(--line)] bg-[var(--paper)] p-6">
              <p className="text-label text-[var(--cinnabar)]">Food note</p>
              <p className="mt-4 text-lg leading-8 text-[var(--ink)]">{city.food}</p>
            </div>
          </aside>

          <div>
            <p className="max-w-3xl text-xl leading-9 text-[var(--ink)]">{city.summary}</p>
            <div className="mt-12 grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
              {city.sections.map((section) => (
                <article key={section.title} className="bg-[var(--paper)] p-6">
                  <p className="text-label text-[var(--cinnabar)]">{section.title}</p>
                  <p className="mt-5 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <Link href={city.routeHref} className="bg-[var(--river-deep)] px-6 py-4 text-center text-sm text-white">
                Follow related story route
              </Link>
              <Link href="/interpreting" className="border border-[var(--line)] px-6 py-4 text-center text-sm">
                Book interpreting support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
