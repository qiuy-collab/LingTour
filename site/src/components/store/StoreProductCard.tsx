"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { FavoriteButton } from "@/components/ui/FavoriteButton";
import { Price } from "@/components/ui/Price";
import type { StoreProduct } from "@/data/store";
import { Reveal } from "@/components/ui/Reveal";
import { MediaFrame } from "@/components/ui/MediaFrame";

type StoreProductCardProps = {
  product: StoreProduct;
  index?: number;
};

export function StoreProductCard({ product, index = 0 }: StoreProductCardProps) {
  const { t } = useLocale();
  const fallbackImage = product.gallery?.find((image) => image?.trim());
  return (
    <Reveal delay={index * 80}>
      <article
        className={[
          "group relative overflow-hidden bg-white shadow-2xl transition-all duration-700 sm:aspect-[4/5] sm:overflow-visible",
          index % 2 === 0 ? "sm:rotate-[-1deg]" : "sm:rotate-[1deg]",
          "sm:hover:-translate-y-4 sm:hover:rotate-0"
        ].join(" ")}
      >
        {/* Physical Tag Attachment */}
        <div className="absolute -top-6 left-1/2 z-0 hidden h-12 w-px -translate-x-1/2 bg-[var(--river-deep)]/20 sm:block" />
        <div className="absolute -top-8 left-1/2 z-0 hidden h-3 w-3 -translate-x-1/2 rounded-full border border-[var(--river-deep)]/20 bg-[var(--paper-deep)] sm:block" />

        <Link href={`/shop/products/${product.slug}`} className="relative z-10 block overflow-hidden">
          <div className="relative aspect-[16/11] bg-[var(--paper)] sm:absolute sm:inset-0 sm:h-full sm:w-full sm:bg-transparent sm:aspect-auto">
            <MediaFrame
              asset={product.primaryMedia}
              fallbackSrc={product.image || fallbackImage}
              alt={product.name}
              mode="preview"
              className="absolute inset-0 bg-[var(--paper)]"
              mediaClassName="object-cover object-center transition-transform duration-1000 group-hover:scale-105 sm:group-hover:scale-110"
            />
            {/* Subtle Glass Overlay for depth */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.1),transparent)] transition-opacity group-hover:opacity-0" />
          </div>
        </Link>

        {/* The Interactive "Specimen Tag" */}
        <div className="relative z-20 border-t border-[var(--line)] bg-[var(--paper)] p-3 shadow-xl transition-transform duration-500 sm:absolute sm:bottom-3 sm:left-3 sm:right-3 sm:border sm:shadow-none md:bottom-4 md:left-4 md:right-4 lg:-bottom-10 lg:-right-4 lg:left-auto lg:w-40 lg:origin-bottom-right lg:rotate-3 lg:p-4 lg:shadow-xl lg:group-hover:rotate-0">
          {/* String loop hole */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[var(--paper-deep)] border border-[var(--line)]" />

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-mono text-[var(--muted)] tracking-[0.18em] uppercase">
                {t("shop.card.curatedObject")}
              </p>
              <FavoriteButton id={product.slug} type="product" title={product.name} variant="dark" />
            </div>

            <h3 className="font-[family:var(--font-display)] text-base leading-tight text-[var(--river-deep)] sm:text-lg">
              {product.name}
            </h3>

            <div className="h-px bg-[var(--line)] w-full" />

            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">{product.tag}</p>
                <p className="text-[10px] font-bold text-[var(--river-deep)]">
                  <Price amount={product.price} currency={product.currency} />
                </p>
              </div>

              <Link href={`/shop/products/${product.slug}`} className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--river-deep)] text-white transition-transform sm:h-11 sm:w-11 sm:group-hover:scale-110">
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
