"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { fetchHomeData, fetchStoreProducts, fetchRoutes } from "@/lib/api-data";
import { useApiQuery, LoadingSpinner, ErrorState } from "@/lib/use-api-query";
import { CultureGallery } from "@/components/home/CultureGallery";
import { GuangdongMapSection } from "@/components/home/GuangdongMapSection";
import { GuangdongEventCalendar } from "@/components/home/GuangdongEventCalendar";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightPanel } from "@/components/ui/SpotlightPanel";

function formatStorePrice(price: number, currency: string) {
  return `${currency} $${price.toFixed(2)}`;
}

const FALLBACK_PRODUCTS = [
  {
    slug: "camphorwood-tray",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=900&q=80",
    name: "Hand-carved Camphorwood Tray",
    tag: "Masterpiece",
    collection: "Chaozhou Heritage",
    price: 128,
    currency: "SGD",
  },
  {
    slug: "volcanic-soil-bowl",
    image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=82",
    name: "Volcanic Soil Tea Bowl",
    tag: "Handcrafted",
    collection: "Zhanjiang Coast",
    price: 32,
    currency: "SGD",
  },
  {
    slug: "lingnan-tea-set",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=82",
    name: "Lingnan Clay Tea Set",
    tag: "Artisan",
    collection: "Lingnan Pottery",
    price: 62,
    currency: "SGD",
  },
  {
    slug: "chaozhou-embroidery",
    image: "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=900&q=82",
    name: "Chaozhou Silk Embroidery",
    tag: "Heritage",
    collection: "Chaozhou Heritage",
    price: 88,
    currency: "SGD",
  },
];

export default function Home() {
  const { t, locale } = useLocale();

  const { data: homeData, loading: homeLoading } = useApiQuery(
    () => fetchHomeData(locale),
    [locale],
  );

  const { data: products } = useApiQuery(
    () => fetchStoreProducts(locale),
    [locale],
  );

  const { data: allRoutes } = useApiQuery(
    () => fetchRoutes(locale),
    [locale],
  );

  if (homeLoading) return <LoadingSpinner text="Preparing the journey..." />;
  if (!homeData) return <ErrorState message="Could not load home data" />;

  const {
    regionShowcase,
    cultureHighlights,
    testimonials,
    trustMetrics,
  } = homeData;

  const storeProducts = products ?? [];
  const storyRoutes = allRoutes ?? [];

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      {/* 1. HERO: THE MASTER REGISTRY */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-40 lg:pb-32">
        <div className="site-container relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-7 z-10">
              <Reveal>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("home.hero.title")}
                  </p>
                </div>
                <h1 className="font-[family:var(--font-display)] text-7xl md:text-9xl lg:text-[10rem] leading-[0.82] tracking-[-0.05em] text-[var(--river-deep)]">
                  Guangdong, <br />
                  <span className="italic text-[var(--gold)]">Deeply</span> <br />
                  Arranged.
                </h1>
                <p className="mt-12 max-w-xl text-xl leading-relaxed text-[var(--muted)] handwritten">
                  {t("home.hero.subtitle")}
                </p>
                <div className="mt-12 flex flex-wrap gap-4">
                  <Link
                    href="/routes"
                    className="btn-primary kinetic-link inline-flex min-w-[15rem] items-center justify-center px-10 py-5 text-xs shadow-[0_18px_40px_rgba(20,52,61,0.22)]"
                  >
                    <span className="relative z-10 text-white">
                      {t("common.btn.explore")}
                    </span>
                  </Link>
                  <Link
                    href="/interpreting"
                    className="px-10 py-5 border border-[var(--line)] bg-white/50 text-[var(--river-deep)] text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-white"
                  >
                    {t("common.btn.bookNow")}
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5 relative mt-16 lg:mt-0">
              <Reveal delay={300}>
                <div className="relative aspect-[4/5] scrapbook-shadow rotate-3 border-[1rem] border-white overflow-hidden group">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                    style={{
                      backgroundImage:
                        "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=82)",
                    }}
                  />
                  <div className="absolute inset-0 bg-black/10" />
                </div>

                {/* Overlapping Stamp/Metric Card */}
                <div className="absolute -top-10 -right-6 w-32 h-32 rounded-full bg-[var(--gold)] flex flex-col items-center justify-center text-[var(--night)] shadow-2xl -rotate-12 border-4 border-white z-20">
                  <span className="font-[family:var(--font-display)] text-3xl leading-none">120+</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest mt-1">Routes</span>
                </div>

                <div className="absolute -bottom-8 -left-8 bg-white p-6 scrapbook-shadow -rotate-6 hidden md:block z-20">
                  <div className="flex gap-10">
                    {trustMetrics.slice(0, 2).map((item: { label: string; value: string }) => (
                      <div key={item.label}>
                        <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">{item.value}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-[var(--muted)] mt-1">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10">
        {/* 2. MAP PILLAR */}
        <GuangdongMapSection cities={regionShowcase} />

        {/* Divider */}
        <div className="site-container"><div className="h-px bg-[var(--line)]" /></div>

        {/* 3. CALENDAR & ROUTE PILLAR */}
        <GuangdongEventCalendar />

        {/* Divider */}
        <div className="site-container"><div className="h-px bg-[var(--line)]" /></div>

        {/* 4. SHOP: THE COLLECTOR'S SHELF */}
        <section className="site-container py-24 lg:py-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
            <div className="max-w-2xl">
              <Reveal>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("shop.page.title")}
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-5xl md:text-7xl leading-[0.95] text-[var(--river-deep)]">
                  {t("home.shop.title")}
                </h2>
              </Reveal>
            </div>
            <Link
              href="/shop"
              className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[var(--river-deep)]"
            >
              <span>Explore full collection</span>
              <div className="w-10 h-px bg-[var(--river-deep)]/30 transition-all group-hover:w-16 group-hover:bg-[var(--cinnabar)]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-16 md:gap-y-0">
            {(storeProducts.length > 0 ? storeProducts : FALLBACK_PRODUCTS).slice(0, 3).map((product, idx) => (
              <Reveal key={product.slug} delay={idx * 150} className={`
                md:col-span-4
                ${idx === 0 ? "md:pr-12" : ""}
                ${idx === 1 ? "md:px-6 md:pt-24" : ""}
                ${idx === 2 ? "md:pl-12 md:pt-12" : ""}
              `}>
                <Link href={`/shop/products/${product.slug}`} className="group block relative">
                  <div className={`relative aspect-[3/4] scrapbook-shadow transition-all duration-700 group-hover:scale-[1.03] ${
                    idx % 2 === 0 ? "rotate-2" : "-rotate-2"
                  }`}>
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${product.image})` }}
                    />
                    <div className="absolute inset-0 border-[0.75rem] border-white shadow-inner" />

                    {/* Price Tag Overlay */}
                    <div className="absolute -bottom-4 -right-4 bg-[var(--gold)] px-4 py-2 text-white shadow-lg rotate-12 z-20">
                      <p className="text-[10px] font-bold tracking-widest">{formatStorePrice(product.price, product.currency)}</p>
                    </div>
                  </div>

                  <div className="mt-10 space-y-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                      {product.tag ?? (product as any).collection ?? "Handpicked"}
                    </p>
                    <h3 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] group-hover:text-[var(--cinnabar)] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)] handwritten max-w-[20ch]">
                      {typeof product.collection === 'string' ? product.collection : ((product as any).collection ?? "Local Archive")}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="site-container"><div className="h-px bg-[var(--line)]" /></div>

        {/* 5. INTERPRETING: THE FIELD NOTES */}
        <section className="site-container py-24 lg:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-px bg-[var(--cinnabar)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
                    {t("interpreting.page.title")}
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-6xl md:text-7xl leading-[0.9] text-[var(--river-deep)] mb-12">
                  {t("home.interpreting.title")}
                </h2>
                <div className="space-y-12">
                  {testimonials.slice(0, 2).map((item: { name: string; quote: string }, index: number) => (
                    <div key={item.name} className="relative pl-12">
                      <div className="absolute left-0 top-0 font-[family:var(--font-display)] text-6xl text-[var(--gold)] opacity-20 italic">“</div>
                      <p className="text-xl leading-relaxed text-[var(--muted)] handwritten italic mb-4">
                        {item.quote}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--river-deep)]">
                        — {item.name}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-16">
                  <Link
                    href="/interpreting"
                    className="px-12 py-5 bg-[var(--river-deep)] text-white text-xs font-bold uppercase tracking-[0.2em] transition-transform hover:scale-105 inline-block"
                  >
                    {t("interpreting.cta.button")}
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-7 relative">
              <Reveal delay={300}>
                <div className="relative aspect-[16/10] scrapbook-shadow rotate-1 border-8 border-white overflow-hidden group">
                  <div className="absolute inset-0 bg-cover bg-center grayscale opacity-60 transition-all duration-1000 group-hover:grayscale-0 group-hover:opacity-100 scale-105"
                    style={{ backgroundImage: "url(https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=84)" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--river-deep)]/20 to-transparent" />

                  {/* Tape decoration */}
                  <div className="absolute top-0 right-1/4 w-12 h-24 bg-white/20 backdrop-blur-sm -rotate-6 z-20" />
                </div>

                {/* Floating Meta Tag */}
                <div className="absolute -bottom-10 right-10 bg-[var(--gold)] p-8 shadow-2xl -rotate-3 z-30">
                  <p className="text-white text-xs font-bold uppercase tracking-widest leading-none">Bilingual Support</p>
                  <p className="mt-3 font-[family:var(--font-display)] text-4xl text-white leading-none">Registry 01</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* 6. CULTURE: THE GALLERY ARCHIVE */}
        <section className="site-container pb-24 lg:pb-40">
          <div className="border-t border-black/5 pt-24 lg:pt-40">
            <CultureGallery highlights={cultureHighlights} />
          </div>
        </section>

        {/* FINAL CTA: THE DEPARTURE LOG */}
        <section className="site-container pb-24 lg:pb-40">
          <div className="relative overflow-hidden bg-[var(--river-deep)] bg-grain px-8 py-24 text-white lg:px-24 lg:py-32 scrapbook-shadow">
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1800&q=82')] bg-cover bg-center grayscale" />
            <div className="relative z-10 max-w-4xl">
              <Reveal>
                <div className="mb-10 opacity-60">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
                    Join the field
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-6xl md:text-8xl leading-[0.85] tracking-[-0.04em] mb-12">
                  Let the route <br />
                  <span className="italic text-[var(--gold)]">Speak for itself.</span>
                </h2>
                <div className="flex flex-wrap gap-6 mt-16">
                  <Link href="/routes" className="px-12 py-5 bg-[var(--gold)] text-[var(--river-deep)] text-xs font-bold uppercase tracking-[0.2em] transition-transform hover:scale-105">
                    Start your log
                  </Link>
                  <Link href="/interpreting" className="px-12 py-5 border border-white/20 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all hover:bg-white/10">
                    Book coordination
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

