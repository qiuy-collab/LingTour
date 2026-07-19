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
    <Reveal delay={index * 70} className="h-full">
      <article className="group flex h-full min-h-[31rem] flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_16px_52px_rgba(17,25,35,0.07)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(17,25,35,0.14)]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper)] sm:aspect-[5/4]">
          <Link href={`/shop/products/${product.slug}`} className="absolute inset-0">
            <MediaFrame
              asset={product.primaryMedia}
              fallbackSrc={product.image || fallbackImage}
              alt={product.name}
              mode="preview"
              className="absolute inset-0"
              mediaClassName="object-cover object-center transition-transform duration-1000 group-hover:scale-[1.045]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgba(8,18,24,0.28))]" />
          </Link>
          <div className="absolute left-4 top-4 rounded-full border border-white/48 bg-black/24 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
            {product.tag || t("shop.card.curatedObject")}
          </div>
          <div className="absolute right-3 top-3">
            <FavoriteButton id={product.slug} type="product" title={product.name} variant="dark" />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
            {product.collection || t("shop.card.curatedObject")}
          </p>
          <Link href={`/shop/products/${product.slug}`}>
            <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-[0.98] tracking-[-0.035em] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)]">
              {product.name}
            </h3>
          </Link>
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--muted)]">
            {product.story}
          </p>

          <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--line)] pt-5">
            <div>
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--muted)]">Collector price</p>
              <p className="mt-1 font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">
                <Price amount={product.price} currency={product.currency} />
              </p>
            </div>
            <Link
              href={`/shop/products/${product.slug}`}
              aria-label={`Open ${product.name}`}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--river-deep)] text-white transition group-hover:translate-x-1 group-hover:bg-[var(--cinnabar)]"
            >
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
