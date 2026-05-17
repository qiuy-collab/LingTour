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
    <section className="bg-[var(--paper-deep)] py-16 lg:py-24">
      <div className="site-container">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-label text-[var(--cinnabar)]">
                Cultural Connection
              </p>
              <h2 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                An object should still feel attached to its place.
              </h2>
              <div className="mt-8 space-y-6 text-base leading-8 text-[var(--muted)]">
                <p>
                  At LingTour, the store is not a separate shelf from the
                  route. {product.name} belongs to the same narrative world as{" "}
                  {collectionLabel.toLowerCase()}. It carries the material
                  logic and story rhythm of the places we guide people through.
                </p>
                <p>
                  The product content system is intentionally lean: collection,
                  product, material notes, and story. That keeps the page
                  focused, consistent, and easier to refine.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative aspect-square overflow-hidden border border-[var(--line)] bg-[var(--night)]">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale transition duration-1000 hover:scale-[1.03] hover:grayscale-0"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.08),rgba(17,25,35,0.42))]" />
              <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/62">
                  LingTour Goods
                </p>
                <p className="mt-4 max-w-md font-[family:var(--font-display)] text-3xl leading-[1.02]">
                  Objects are how a route stays in the room after the traveler leaves.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
