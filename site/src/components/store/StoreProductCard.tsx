"use client";

import Link from "next/link";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import type { StoreProduct } from "@/data/store";
import { Reveal } from "@/components/ui/Reveal";

function formatStorePrice(product: Pick<StoreProduct, "currency" | "price">) {
  return `${product.currency} $${product.price.toFixed(2)}`;
}

type StoreProductCardProps = {
  product: StoreProduct;
  index?: number;
};

export function StoreProductCard({ product, index = 0 }: StoreProductCardProps) {
  return (
    <Reveal delay={index * 80}>
      <Link href={`/shop/products/${product.slug}`} className="group block">
        <article
          className={[
            "relative aspect-[4/5] bg-[var(--paper)] transition-all duration-700 scrapbook-shadow border border-[var(--line)]",
            index % 3 === 0 ? "rotate-[-1.5deg]" : index % 3 === 1 ? "rotate-[1deg]" : "rotate-[2deg]",
            "hover:rotate-0 hover:-translate-y-4 hover:shadow-[0_32px_90px_rgba(0,0,0,0.12)]"
          ].join(" ")}
        >
          <div className="absolute inset-0 p-3">
            <div className="relative h-full w-full overflow-hidden border border-[var(--line)]">
              <div
                className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--river-deep)]/60 via-transparent to-transparent opacity-40 group-hover:opacity-20 transition-opacity" />
            </div>
          </div>

          <div className="absolute right-6 top-6 z-20">
            <FavoriteButton id={product.slug} type="product" title={product.name} variant="dark" />
          </div>

          <div className="absolute -right-2 top-12 z-20 rotate-90 origin-right">
             <span className="bg-[var(--gold)] text-white text-[8px] font-bold px-3 py-1 uppercase tracking-widest shadow-sm">
               {formatStorePrice(product)}
             </span>
          </div>

          <div className="relative z-10 flex h-full flex-col justify-end p-8 text-white">
            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-2 handwritten">
                {product.tag}
              </p>
              <h3 className="font-[family:var(--font-display)] text-3xl leading-tight text-white drop-shadow-md">
                {product.name}
              </h3>
              <div className="mt-4 flex items-center justify-between border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                  {typeof product.collection === 'string' ? product.collection : (product.collection as any)?.title}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-widest underline underline-offset-4">Details</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </Reveal>
  );
}
