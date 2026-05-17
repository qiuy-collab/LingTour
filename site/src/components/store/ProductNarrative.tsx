"use client";

import { type StoreProduct } from "@/data/store";
import { Reveal } from "@/components/ui/Reveal";

type ProductNarrativeProps = {
  product: StoreProduct;
};

export function ProductNarrative({ product }: ProductNarrativeProps) {
  const collectionLabel =
    typeof product.collection === "string"
      ? product.collection
      : "LingTour Goods";

  return (
    <section className="bg-[var(--paper-deep)] bg-grain py-24 lg:py-32 border-y border-[var(--river-deep)]/10">
      <div className="site-container">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Reveal>
            <div className="max-w-2xl space-y-8">
              <div>
                <p className="font-handwritten text-2xl text-[var(--gold)]">
                  Cultural Connection
                </p>
                <h2 className="mt-4 font-[family:var(--font-display)] text-5xl leading-tight text-[var(--river-deep)] md:text-6xl">
                  An object should still feel <span className="italic underline decoration-[var(--gold)]/30 underline-offset-8">attached</span> to its place.
                </h2>
              </div>

              <div className="space-y-6 text-lg leading-relaxed text-[var(--river-deep)]/70">
                <p>
                  At LingTour, the store is not a separate shelf from the
                  route. <span className="font-bold text-[var(--river-deep)]">{product.name}</span> belongs to the same narrative world as{" "}
                  {collectionLabel.toLowerCase()}. It carries the material
                  logic and story rhythm of the places we guide people through.
                </p>
                <p className="border-l-2 border-[var(--gold)] pl-6 italic">
                  The product content system is intentionally lean: collection,
                  product, material notes, and story. That keeps the page
                  focused, consistent, and easier to refine.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative aspect-[3/4] w-full bg-white p-6 scrapbook-shadow rotate-2">
              {/* Tape effect */}
              <div className="absolute -top-3 right-12 h-8 w-24 rotate-12 bg-white/40 backdrop-blur-sm border border-white/20 z-10" />

              <div className="relative h-full w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale transition duration-1000 hover:scale-105 hover:grayscale-0"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(17,25,35,0.4))] " />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <p className="font-handwritten text-xl text-[var(--gold)]">
                    LingTour Goods
                  </p>
                  <p className="mt-2 font-[family:var(--font-display)] text-2xl leading-tight">
                    Objects are how a route stays in the room after the traveler leaves.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
