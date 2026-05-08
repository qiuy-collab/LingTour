import Link from "next/link";
import { CultureGallery } from "@/components/home/CultureGallery";
import { FeaturedRoutesCarousel } from "@/components/home/FeaturedRoutesCarousel";
import { GuangdongMapSection } from "@/components/home/GuangdongMapSection";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightPanel } from "@/components/ui/SpotlightPanel";
import {
  homeEntryCards,
  serviceSteps,
  testimonials,
  trustMetrics,
} from "@/data/home";
import { formatStorePrice, storeProducts } from "@/data/store";

export default function Home() {
  return (
    <div>
      <section className="relative min-h-[calc(100svh-73px)] overflow-hidden bg-[var(--night)] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-72"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1800&q=82)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.94),rgba(17,25,35,0.55)_48%,rgba(17,25,35,0.18))]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-[linear-gradient(0deg,var(--background),transparent)]" />

        <div className="site-container relative flex min-h-[calc(100svh-73px)] flex-col justify-between py-10 md:py-12">
          <div className="max-w-4xl pt-6 lg:pt-20">
            <p className="text-label text-white/62">Guangdong cultural travel service</p>
            <h1 className="mt-5 font-[family:var(--font-display)] text-[3.4rem] leading-[0.98] text-white sm:text-6xl md:text-7xl lg:text-8xl">
              LingTour Guangdong
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
              Explore Guangdong through city stories, route narratives, cultural interpretation, and
              Lingnan-inspired objects designed for international visitors.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/routes"
                className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-[var(--cinnabar-deep)]"
              >
                Explore routes
              </Link>
              <Link
                href="/interpreting"
                className="border border-white/30 px-6 py-4 text-center text-sm font-medium text-white transition hover:bg-white hover:text-[var(--night)]"
              >
                Book interpreting
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 border-t border-white/14 pt-6 sm:grid-cols-3">
            {trustMetrics.map((item) => (
              <div key={item.label}>
                <p className="font-[family:var(--font-display)] text-3xl sm:text-4xl">{item.value}</p>
                <p className="mt-1 text-label text-white/52">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-12 lg:py-20">
        <div className="grid gap-8 border-l border-[var(--cinnabar)]/30 pl-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(22rem,0.58fr)] lg:items-start lg:pl-8">
          <div className="max-w-3xl">
            <p className="text-label text-[var(--cinnabar)]">Platform entrances</p>
            <h2 className="mt-4 max-w-[16ch] font-[family:var(--font-display)] text-4xl leading-[1.1] text-[var(--river-deep)] md:text-[2.85rem]">
              Start from culture, route, service, or store.
            </h2>
          </div>
          <p className="max-w-2xl pt-1 text-base leading-8 text-[var(--muted)] lg:pt-12">
            The homepage works as a gateway: learn the culture, choose a story route, book language
            support, or browse products linked to Lingnan memory.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {homeEntryCards.map((card, index) => (
            <Reveal key={card.href} delay={index * 90}>
              <Link href={card.href} className="group block">
                <SpotlightPanel className="lux-card min-h-[18rem] border border-[var(--line)] bg-[var(--paper)] p-6">
                  <p className="text-label text-[var(--muted)]">{card.id}</p>
                  <h3 className="mt-8 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)] transition group-hover:translate-x-1 sm:text-3xl">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-[var(--muted)]">{card.body}</p>
                  <p className="mt-8 text-sm font-medium text-[var(--cinnabar)] transition group-hover:translate-x-2">
                    Enter
                  </p>
                </SpotlightPanel>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <GuangdongMapSection />

      <FeaturedRoutesCarousel />
      <CultureGallery />

      <section className="site-container py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Interpreting service</p>
            <h2 className="mt-4 max-w-[17ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              Practical support, carried by cultural context.
            </h2>
            <Link
              href="/interpreting"
              className="mt-8 inline-block bg-[var(--river-deep)] px-6 py-4 text-sm font-medium text-white transition hover:bg-[var(--night)]"
            >
              Start booking
            </Link>
          </div>

          <div className="grid gap-4">
            {serviceSteps.map((step, index) => (
              <Reveal key={step.step} delay={index * 80}>
                <SpotlightPanel className="lux-card grid gap-4 border border-[var(--line)] bg-[var(--paper)] p-5 sm:grid-cols-[4rem_1fr]">
                  <p className="font-[family:var(--font-display)] text-3xl text-[var(--cinnabar)]">{step.step}</p>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--ink)]">{step.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{step.description}</p>
                  </div>
                </SpotlightPanel>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--paper-deep)] py-16 lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Lingnan store</p>
            <h2 className="mt-4 max-w-[18ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              Let the journey continue through objects.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--muted)]">
              The store should feel closer to a museum shop than a discount marketplace: fewer products,
              stronger stories, clearer cultural origin.
            </p>
            <Link href="/shop" className="kinetic-link mt-8 inline-block bg-[var(--cinnabar)] px-6 py-4 text-sm font-medium text-white">
              Enter store
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {storeProducts.slice(0, 4).map((product) => (
              <Link
                key={product.slug}
                href={`/checkout?product=${product.slug}`}
                className="group lux-card relative aspect-square overflow-hidden bg-[var(--night)] text-white shadow-[var(--shadow-soft)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-78 transition duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.08),rgba(17,25,35,0.82))]" />
                <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
                  <p className="text-label text-white/62">{product.tag}</p>
                  <h3 className="mt-2 font-[family:var(--font-display)] text-xl leading-tight sm:text-2xl">{product.name}</h3>
                  <p className="mt-2 translate-y-0 text-sm text-white/82 transition duration-300 md:translate-y-4 md:text-white/0 md:group-hover:translate-y-0 md:group-hover:text-white/82">
                    {formatStorePrice(product)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-16 lg:py-20">
        <div className="mb-8 max-w-3xl">
          <p className="text-label text-[var(--cinnabar)]">Visitor voices</p>
          <h2 className="mt-4 max-w-[18ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
            Short proof that the story route idea lands.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <Reveal key={item.name} delay={index * 90}>
              <SpotlightPanel className="lux-card min-h-full border-l-2 border-[var(--cinnabar)] bg-[var(--paper)] p-6">
                <blockquote>
                  <p className="text-lg leading-8 text-[var(--ink)]">&quot;{item.quote}&quot;</p>
                  <footer className="mt-5 text-sm text-[var(--muted)]">{item.name}</footer>
                </blockquote>
              </SpotlightPanel>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="site-container pb-6">
        <div className="bg-[var(--night)] px-6 py-12 text-white lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-label text-white/48">Start your Guangdong story</p>
              <h2 className="mt-4 max-w-[20ch] font-[family:var(--font-display)] text-4xl leading-[1.12] md:text-[2.85rem]">
                Pick a city, follow a story, and book the support you need.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/routes" className="bg-white px-6 py-4 text-center text-sm font-semibold text-[#111923] shadow-sm transition hover:bg-[var(--paper-deep)]">
                View routes
              </Link>
              <Link
                href="/interpreting"
                className="border border-white/24 px-6 py-4 text-center text-sm font-medium text-white"
              >
                Book support
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
