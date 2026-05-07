"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "@/data/store";

type ProductActionsProps = {
  product: StoreProduct;
};

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [added, setAdded] = useState(false);

  function persistCart(redirect: boolean) {
    const cartItem = {
      slug: product.slug,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      quantity: 1,
    };

    window.localStorage.setItem("lingtour-cart", JSON.stringify([cartItem]));
    setAdded(true);

    if (redirect) {
      router.push(`/checkout?product=${product.slug}`);
    }
  }

  return (
    <div className="mt-7 grid gap-2 sm:grid-cols-2">
      <button
        type="button"
        className="border border-[var(--line)] bg-white px-5 py-3 text-sm transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
        onClick={() => persistCart(false)}
      >
        {added ? "Added to cart" : "Add to cart"}
      </button>
      <button
        type="button"
        className="bg-[var(--cinnabar)] px-5 py-3 text-sm text-white transition hover:bg-[var(--cinnabar-deep)]"
        onClick={() => persistCart(true)}
      >
        Buy now
      </button>
    </div>
  );
}
