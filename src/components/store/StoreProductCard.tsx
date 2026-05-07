"use client";

import { ProductActions } from "@/components/store/ProductActions";
import { FavoriteButton } from "@/components/account/FavoriteButton";
import { formatStorePrice, type StoreProduct } from "@/data/store";

type StoreProductCardProps = {
  product: StoreProduct;
};

export function StoreProductCard({ product }: StoreProductCardProps) {
  return (
    <article className="group relative min-h-[36rem] overflow-hidden bg-[var(--night)] text-white shadow-[0_24px_70px_rgba(17,25,35,0.18)]">
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url(${product.image})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.18),rgba(17,25,35,0.42)_48%,rgba(17,25,35,0.92))]" />
      <div className="relative z-10 flex min-h-[36rem] flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-4">
          <p className="text-label text-white/70">{product.tag}</p>
          <div className="grid justify-items-end gap-3">
            <p className="text-sm font-semibold text-white">{formatStorePrice(product)}</p>
            <FavoriteButton id={product.slug} type="product" title={product.name} variant="dark" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/78">{product.collection}</p>
          <h3 className="mt-3 font-[family:var(--font-display)] text-3xl leading-tight text-white md:text-4xl">
            {product.name}
          </h3>
          <div className="mt-5 max-h-0 translate-y-8 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-80 group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-base leading-8 text-white/84">{product.story}</p>
            <ProductActions product={product} />
          </div>
        </div>
      </div>
    </article>
  );
}
