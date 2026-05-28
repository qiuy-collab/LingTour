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
      <article
        className={[
          "relative aspect-[4/5] bg-white transition-all duration-700 shadow-2xl overflow-visible",
          index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]",
          "hover:rotate-0 hover:-translate-y-4 group"
        ].join(" ")}
      >
        {/* Physical Tag Attachment */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-px h-12 bg-[var(--river-deep)]/20 z-0" />
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border border-[var(--river-deep)]/20 bg-[var(--paper-deep)] z-0" />

        <Link href={`/shop/products/${product.slug}`} className="block h-full w-full relative z-10 overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-all duration-1000 group-hover:scale-110"
          />
          {/* Subtle Glass Overlay for depth */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),transparent)] group-hover:opacity-0 transition-opacity" />
        </Link>

        {/* The Interactive "Specimen Tag" */}
        <div className="absolute -bottom-10 -right-4 z-20 w-40 bg-[var(--paper)] border border-[var(--line)] p-4 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500 origin-bottom-right scale-75 sm:scale-100">
          {/* String loop hole */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[var(--paper-deep)] border border-[var(--line)]" />

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono text-[var(--muted)] tracking-tighter uppercase">ID_{product.slug.slice(0, 8)}</p>
              <FavoriteButton id={product.slug} type="product" title={product.name} variant="dark" />
            </div>

            <h3 className="font-[family:var(--font-display)] text-lg leading-tight text-[var(--river-deep)]">
              {product.name}
            </h3>

            <div className="h-px bg-[var(--line)] w-full" />

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">{product.tag}</p>
                <p className="text-[10px] font-bold text-[var(--river-deep)]">{formatStorePrice(product)}</p>
              </div>

              <Link href={`/shop/products/${product.slug}`} className="w-11 h-11 rounded-full bg-[var(--river-deep)] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Hover Highlight (Light Leak) */}
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_top_right,rgba(185,138,70,0.1),transparent_70%)]" />
      </article>
    </Reveal>
  );
}
