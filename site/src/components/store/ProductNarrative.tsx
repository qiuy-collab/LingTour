"use client";

import Link from "next/link";
import { useMemo } from "react";
import { type StoreProduct } from "@/data/store";
import { Reveal } from "@/components/ui/Reveal";
import { getMapFeatures, buildProjection, featureToPath, type CityFeature } from "@/lib/map-projection";

type ProductNarrativeProps = {
  product: StoreProduct;
};

function OriginMapHighlight({ adcode, cityName }: { adcode: number; cityName: string }) {
  const features = useMemo(() => getMapFeatures(), []);
  const mapData = useMemo(() => {
    if (!features.length) return null;
    const projection = buildProjection(features, 300, 300, 16);
    return {
      width: projection.width,
      height: projection.height,
      paths: features.map((f: CityFeature) => ({
        adcode: f.properties.adcode,
        path: featureToPath(f, projection.point),
      })),
    };
  }, [features]);

  if (!mapData) {
    return (
      <div className="grid h-full place-items-center text-xs text-[var(--muted)]">
        Map loading
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${mapData.width} ${mapData.height}`}
      className="h-full w-full"
      role="img"
      aria-label={`${cityName} on Guangdong map`}
    >
      <title>{cityName} — origin location</title>
      {mapData.paths.map((city) => {
        const isOrigin = city.adcode === adcode;
        return (
          <path
            key={city.adcode}
            d={city.path}
            fill={isOrigin ? "#b64235" : "#d8d0c2"}
            stroke="#fffaf1"
            strokeWidth={isOrigin ? 1.2 : 0.6}
            opacity={isOrigin ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}

export function ProductNarrative({ product }: ProductNarrativeProps) {
  return (
    <div>
      {/* Existing narrative */}
      <section className="bg-[var(--paper-deep)] py-16 lg:py-24">
        <div className="site-container">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-label text-[var(--cinnabar)]">Cultural Connection</p>
                <h2 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                  An object is a piece of the journey, carried home.
                </h2>
                <div className="mt-8 space-y-6 text-base leading-8 text-[var(--muted)]">
                  <p>
                    At LingTour, we believe objects should stay connected to the places they come from.
                    This {product.name?.toLowerCase() || "item"} is not a generic souvenir — it is a tactile record
                    of the {typeof product.collection === "string" ? product.collection.toLowerCase() : "collection"}.
                  </p>
                  <p>
                    Every material and design choice draws from the city stories we tell. When you use
                    this object, you are holding a piece of Guangdong — its craft traditions, its
                    landscapes, and its daily rhythms.
                  </p>
                </div>
                <div className="mt-10">
                  <Link
                    href="/routes"
                    className="group inline-flex items-center gap-3 text-sm font-semibold text-[var(--cinnabar)] transition"
                  >
                    Explore the routes that inspired this collection
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative aspect-square overflow-hidden border border-[var(--line)]">
                <div className="absolute inset-0 bg-cover bg-center grayscale transition duration-1000 hover:grayscale-0"
                     style={{ backgroundImage: `url(${product.image})` }} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-white backdrop-blur-[2px]">
                  <div className="p-8 text-center">
                    <p className="font-[family:var(--font-display)] text-2xl italic">&quot;Objects are the nouns of travel.&quot;</p>
                    <p className="mt-4 text-xs uppercase tracking-[0.2em] opacity-60">— LingTour Philosophy</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Origin Trace module */}
      {product.originTrace && (
        <section className="bg-white py-16 lg:py-24">
          <div className="site-container">
            <div className="border-t border-[var(--line)] pt-16">
              <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
                {/* Left: Deep description */}
                <Reveal>
                  <div>
                    <p className="text-label text-[var(--cinnabar)]">Origin Trace</p>
                    <h2 className="mt-5 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] md:text-4xl">
                      Where the volcanic clay comes from
                    </h2>
                    <div className="mt-8 space-y-6 text-base leading-8 text-[var(--muted)]">
                      <div>
                        <p className="text-label text-[var(--cinnabar)] mb-2">Material</p>
                        <p>{product.originTrace.materialSource}</p>
                      </div>
                      <div>
                        <p className="text-label text-[var(--cinnabar)] mb-2">Craft Tradition</p>
                        <p>{product.originTrace.craftTradition}</p>
                      </div>
                      <div>
                        <p className="text-label text-[var(--cinnabar)] mb-2">Process</p>
                        <p>{product.originTrace.process}</p>
                      </div>
                    </div>
                    <div className="mt-10">
                      <Link
                        href={`/culture/${product.originTrace.citySlug}`}
                        className="group inline-flex items-center gap-3 text-sm font-semibold text-[var(--cinnabar)] transition"
                      >
                        Back to the {product.originTrace.cityName} story
                        <span className="transition-transform group-hover:translate-x-1">→</span>
                      </Link>
                    </div>
                  </div>
                </Reveal>

                {/* Right: Origin location map */}
                <Reveal delay={150}>
                  <div className="relative aspect-square overflow-hidden border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-soft)]">
                    <OriginMapHighlight
                      adcode={product.originTrace.mapAdcode}
                      cityName={product.originTrace.cityName}
                    />
                    <div className="absolute bottom-4 left-4 right-4 border border-[var(--line)] bg-white/90 p-4 backdrop-blur-sm">
                      <p className="text-label text-[var(--cinnabar)]">{product.originTrace.location}</p>
                      <p className="mt-1 text-xs text-[var(--muted)]">Origin of materials</p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
