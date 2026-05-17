"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoreProduct } from "@/data/store";
import { ProductActions } from "@/components/store/ProductActions";
import { Reveal } from "@/components/ui/Reveal";

function formatStorePrice(product: Pick<StoreProduct, "currency" | "price">) {
  return `${product.currency} $${product.price.toFixed(2)}`;
}

function buildNoteWords(product: StoreProduct) {
  const source = [
    product.tag,
    product.materialNotes,
  ]
    .filter(Boolean)
    .join(" ");

  const words = Array.from(
    new Set(
      source
        .replace(/[^a-zA-Z\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3),
    ),
  );

  return words.slice(0, 3);
}

function buildShortStory(story: string) {
  const trimmed = story.trim();
  const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0] || trimmed;
  return firstSentence.length > 140
    ? `${firstSentence.slice(0, 137).trim()}...`
    : firstSentence;
}

type ProductDetailHeroProps = {
  product: StoreProduct;
};

export function ProductDetailHero({ product }: ProductDetailHeroProps) {
  const images = useMemo(
    () => Array.from(new Set([product.image, ...(product.gallery || [])])),
    [product.gallery, product.image],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [finish, setFinish] = useState("Collector finish");
  const [edition, setEdition] = useState("Single object");
  const noteWords = buildNoteWords(product);
  const shortStory = buildShortStory(product.story);
  const activeImage = images[activeIndex] || product.image;
  const collectionLabel =
    typeof product.collection === "string"
      ? product.collection
      : (product.collection as { title?: string })?.title || "LingTour Goods";

  return (
    <section className="overflow-hidden bg-[var(--paper-deep)] pb-10 pt-6 lg:pb-16 lg:pt-8">
      <div className="border-y border-[rgba(20,33,47,0.12)] bg-[rgba(246,238,229,0.82)]">
        <div className="site-container py-3">
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--river-deep)]">
            <span className="rounded-full border border-[rgba(20,33,47,0.1)] bg-white/65 px-3 py-1 text-[10px] tracking-[0.2em] text-[var(--cinnabar)]">
              Studio dispatch
            </span>
            <span className="text-[rgba(20,33,47,0.62)]">
              Free route-linked packing for this object.
            </span>
          </div>
        </div>
      </div>

      <div className="site-container pt-7 lg:pt-10">
        <div className="grid gap-8 border border-[rgba(20,33,47,0.12)] bg-[rgba(251,245,239,0.88)] p-5 shadow-[0_30px_90px_rgba(17,25,35,0.08)] lg:grid-cols-[0.82fr_1.06fr_0.82fr] lg:gap-10 lg:p-8">
          <Reveal>
            <aside className="flex flex-col gap-6 border-[rgba(20,33,47,0.12)] lg:border-r lg:pr-8">
              <div className="w-fit min-w-[16rem] rounded-[1.4rem] bg-[var(--cinnabar)]/84 px-5 py-5 text-white shadow-[0_16px_40px_rgba(182,66,53,0.16)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/68">
                  Collection
                </p>
                <p className="mt-4 whitespace-nowrap font-[family:var(--font-display)] text-[2.1rem] leading-none tracking-[-0.05em]">
                  {collectionLabel}
                </p>
              </div>

              <div className="border-b border-[rgba(20,33,47,0.08)] pb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
                  Product
                </p>
                <h1 className="mt-3 max-w-[12ch] font-[family:var(--font-display)] text-[3rem] leading-[0.88] tracking-[-0.07em] text-[var(--river-deep)]">
                  {product.name}
                </h1>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[rgba(20,33,47,0.42)]">
                  {product.tag}
                </p>
              </div>

              <div className="space-y-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--river-deep)]">
                  Material notes
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {noteWords.map((word) => (
                    <span
                      key={word}
                      className="rounded-full border border-[rgba(20,33,47,0.1)] bg-[var(--paper)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--river-deep)]"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-[rgba(20,33,47,0.08)] pt-5">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--river-deep)]">
                  Story
                </p>
                <p className="mt-4 max-w-sm text-base leading-8 text-[rgba(20,33,47,0.72)]">
                  {shortStory}
                </p>
              </div>

            </aside>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex flex-col items-center justify-between gap-5">
              <div className="flex w-full items-center justify-between px-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[rgba(20,33,47,0.52)]">
                <nav
                  aria-label="Product breadcrumb"
                  className="flex flex-wrap items-center gap-2"
                >
                  <Link
                    href="/"
                    className="rounded-full border border-transparent px-2 py-1 transition hover:border-[rgba(20,33,47,0.1)] hover:bg-white/70 hover:text-[var(--river-deep)]"
                  >
                    Home
                  </Link>
                  <span className="text-[rgba(20,33,47,0.26)]">/</span>
                  <Link
                    href="/shop"
                    className="rounded-full border border-transparent px-2 py-1 transition hover:border-[rgba(20,33,47,0.1)] hover:bg-white/70 hover:text-[var(--river-deep)]"
                  >
                    Shop
                  </Link>
                  <span className="text-[rgba(20,33,47,0.26)]">/</span>
                  <Link
                    href="/shop/products"
                    className="rounded-full border border-[rgba(20,33,47,0.08)] bg-white/60 px-2.5 py-1 text-[rgba(20,33,47,0.68)] transition hover:border-[rgba(20,33,47,0.16)] hover:bg-white hover:text-[var(--river-deep)]"
                  >
                    {collectionLabel}
                  </Link>
                </nav>
                <span>{String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
              </div>

              <div className="relative flex min-h-[28rem] w-full items-center justify-center overflow-visible bg-[radial-gradient(circle_at_50%_32%,rgba(255,255,255,0.88),rgba(244,231,220,0.75)_44%,rgba(235,224,211,0.28)_72%,transparent_100%)] px-6 py-8 lg:min-h-[38rem] lg:px-12">
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() =>
                    setActiveIndex((current) =>
                      current === 0 ? images.length - 1 : current - 1,
                    )
                  }
                  className="absolute left-1 top-1/2 z-10 grid h-11 w-11 -translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-[rgba(20,33,47,0.1)] bg-white/72 text-[var(--river-deep)] shadow-[0_14px_34px_rgba(17,25,35,0.12)] transition hover:bg-white lg:-left-3 lg:h-12 lg:w-12"
                >
                  <span className="text-xl leading-none">&#8249;</span>
                </button>

                <img
                  src={activeImage}
                  alt={product.name}
                  className="max-h-[30rem] w-auto max-w-full object-contain drop-shadow-[0_35px_45px_rgba(17,25,35,0.16)] transition-transform duration-500 hover:scale-[1.02] lg:max-h-[36rem]"
                />

                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() =>
                    setActiveIndex((current) => (current + 1) % images.length)
                  }
                  className="absolute right-1 top-1/2 z-10 grid h-11 w-11 translate-x-1/3 -translate-y-1/2 place-items-center rounded-full border border-[rgba(20,33,47,0.1)] bg-white/72 text-[var(--river-deep)] shadow-[0_14px_34px_rgba(17,25,35,0.12)] transition hover:bg-white lg:-right-3 lg:h-12 lg:w-12"
                >
                  <span className="text-xl leading-none">&#8250;</span>
                </button>
              </div>

              <div className="flex w-full items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={`h-16 w-16 overflow-hidden rounded-2xl border transition ${
                        activeIndex === index
                          ? "border-[var(--river-deep)] shadow-[0_12px_28px_rgba(17,25,35,0.12)]"
                          : "border-[rgba(20,33,47,0.12)] opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[rgba(20,33,47,0.54)]">
                  Studio view
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <aside className="border-[rgba(20,33,47,0.12)] bg-[rgba(255,249,244,0.74)] p-5 lg:border lg:p-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--river-deep)]">
                  Reviews
                </p>
                <div className="mt-4 flex items-center gap-3 border-b border-dashed border-[rgba(20,33,47,0.18)] pb-5">
                  <div className="flex items-center gap-1 text-[var(--river-deep)]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        viewBox="0 0 24 24"
                        className="h-4 w-4 fill-current"
                        aria-hidden="true"
                      >
                        <path d="M12 2.8l2.87 5.82 6.43.93-4.65 4.53 1.1 6.41L12 17.45l-5.75 3.04 1.1-6.41-4.65-4.53 6.43-.93L12 2.8z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-[rgba(20,33,47,0.68)]">4.9 (20)</p>
                </div>
              </div>

              <div className="mt-6 border-b border-dashed border-[rgba(20,33,47,0.18)] pb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--river-deep)]">
                  Price
                </p>
                <p className="mt-4 font-[family:var(--font-display)] text-5xl leading-none tracking-[-0.04em] text-[var(--river-deep)]">
                  {formatStorePrice(product)}
                </p>
              </div>

              <div className="mt-6 border-b border-dashed border-[rgba(20,33,47,0.18)] pb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--river-deep)]">
                  Finish
                </p>
                <div className="mt-4 grid gap-3">
                  {["Collector finish", "Daily use finish"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFinish(option)}
                      className={`flex items-center justify-between border px-4 py-3 text-left text-sm transition ${
                        finish === option
                          ? "border-[var(--river-deep)] bg-white text-[var(--river-deep)]"
                          : "border-[rgba(20,33,47,0.14)] bg-[rgba(255,255,255,0.46)] text-[rgba(20,33,47,0.65)] hover:bg-white"
                      }`}
                    >
                      <span>{option}</span>
                      {finish === option ? <span>Selected</span> : null}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-b border-dashed border-[rgba(20,33,47,0.18)] pb-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--river-deep)]">
                  Edition
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["Single object", "Gift set"].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setEdition(option)}
                      className={`border px-4 py-3 text-sm font-semibold transition ${
                        edition === option
                          ? "border-[var(--river-deep)] bg-[var(--river-deep)] text-white"
                          : "border-[rgba(20,33,47,0.14)] bg-white/62 text-[var(--river-deep)] hover:bg-white"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <ProductActions product={product} variant="editorial" />
              </div>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
