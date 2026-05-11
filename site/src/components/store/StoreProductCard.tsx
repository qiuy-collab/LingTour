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
        <article className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)] shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[0_24px_70px_rgba(17,25,35,0.12)]">
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
            style={{ backgroundImage: `url(${product.image})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0),rgba(17,25,35,0.05)_60%,rgba(17,25,35,0.85))]" />
          
          <div className="absolute right-4 top-4 z-20">
            <FavoriteButton id={product.slug} type="product" title={product.name} variant="dark" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-end p-6 text-white sm:p-8">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">{product.tag}</span>
            </div>
            <h3 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight sm:text-3xl">
              {product.name}
            </h3>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <p className="text-sm text-white/80">{product.collection}</p>
              <p className="font-semibold">{formatStorePrice(product)}</p>
            </div>
          </div>
        </article>
      </Link>
    </Reveal>
  );
}
