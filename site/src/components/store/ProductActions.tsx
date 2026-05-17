"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreProduct } from "@/data/store";

type ProductActionsProps = {
  product: StoreProduct;
  variant?: "dark" | "light" | "editorial";
};

export function ProductActions({ product, variant = "dark" }: ProductActionsProps) {
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

    const existing = window.localStorage.getItem("lingtour-cart");
    const cart = existing ? JSON.parse(existing) : [];
    const updated = [...cart, cartItem];

    window.localStorage.setItem("lingtour-cart", JSON.stringify(updated));
    setAdded(true);

    if (redirect) {
      router.push(`/checkout?product=${product.slug}`);
    }
  }

  const baseBtn = "px-8 py-4 text-sm font-medium transition-all duration-300 active:scale-95";
  const darkClasses = {
    secondary: "border border-white/72 bg-white/10 text-white backdrop-blur hover:bg-white hover:text-[var(--night)]",
    primary: "bg-[var(--cinnabar)] text-white hover:bg-[var(--cinnabar-deep)]",
  };
  const lightClasses = {
    secondary: "border border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--cinnabar)]",
    primary: "bg-[var(--river-deep)] text-white hover:bg-[var(--night)]",
  };
  const editorialClasses = {
    secondary:
      "border border-[rgba(20,33,47,0.14)] bg-white text-[var(--river-deep)] hover:border-[var(--river-deep)]",
    primary: "bg-[var(--night)] text-white hover:bg-[var(--river-deep)]",
  };

  const classes =
    variant === "dark"
      ? darkClasses
      : variant === "editorial"
        ? editorialClasses
        : lightClasses;

  return (
    <div className="grid gap-3">
      <button
        type="button"
        className={`${baseBtn} ${classes.primary}`}
        onClick={() => persistCart(false)}
      >
        {added ? "Added to bag" : "Add to bag"}
      </button>
      <button
        type="button"
        className={`${baseBtn} ${classes.secondary}`}
        onClick={() => persistCart(true)}
      >
        Buy now
      </button>
    </div>
  );
}
