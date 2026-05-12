"use client";

import { useState } from "react";
import type { StoreProduct } from "@/data/store";
import { ProductActions } from "@/components/store/ProductActions";
import { Reveal } from "@/components/ui/Reveal";

function formatStorePrice(product: Pick<StoreProduct, "currency" | "price">) {
  return `${product.currency} $${product.price.toFixed(2)}`;
}

type ProductDetailHeroProps = {
  product: StoreProduct;
};

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const [activeImage, setActiveImage] = useState(product.image);
  const images = [product.image, ...(product.gallery || [])];

  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="site-container">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* Gallery side */}
          <div className="grid gap-4">
            <Reveal>
              <div className="aspect-[4/5] overflow-hidden bg-[var(--paper-deep)]">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-1000"
                />
              </div>
            </Reveal>
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`aspect-square overflow-hidden border-2 transition-colors ${
                    activeImage === img ? "border-[var(--cinnabar)]" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info side */}
          <div className="lg:sticky lg:top-28">
            <Reveal delay={100}>
              <p className="text-label text-[var(--cinnabar)]">{typeof product.collection === 'string' ? product.collection : (product.collection as any)?.title}</p>
              <h1 className="mt-5 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl lg:text-6xl">
                {product.name}
              </h1>
              <p className="mt-6 text-2xl font-semibold text-[var(--ink)]">
                {formatStorePrice(product)}
              </p>
              
              <div className="mt-8 border-y border-[var(--line)] py-8">
                <p className="text-sm uppercase tracking-[0.16em] text-[var(--muted)]">The Story</p>
                <p className="mt-4 text-base leading-8 text-[var(--ink)]">
                  {product.story}
                </p>
              </div>

              <div className="mt-8 space-y-6">
                {product.details && (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Material</p>
                      <p className="mt-1 font-medium">{product.details.material}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Dimensions</p>
                      <p className="mt-1 font-medium">{product.details.dimensions}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Origin</p>
                      <p className="mt-1 font-medium">{product.details.origin}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Care</p>
                      <p className="mt-1 font-medium">{product.details.care}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <ProductActions product={product} variant="light" />
                </div>
              </div>

              <div className="mt-10 flex items-center gap-6 border-t border-[var(--line)] pt-8">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-[var(--paper-deep)]" />
                  ))}
                </div>
                <p className="text-xs text-[var(--muted)]">
                  Part of the <span className="font-semibold text-[var(--ink)]">{typeof product.collection === 'string' ? product.collection : (product.collection as any)?.title}</span> collection.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
