"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoreProduct } from "@/data/store";
import { ProductActions } from "@/components/store/ProductActions";
import { Reveal } from "@/components/ui/Reveal";
import { Price } from "@/components/ui/Price";
import { MediaFrame } from "@/components/ui/MediaFrame";
import {
  dedupeMedia,
  resolveMediaGallery,
  resolvePrimaryMedia,
} from "@/types/media";

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
  const media = useMemo(
    () => {
      const primary = resolvePrimaryMedia(product.primaryMedia, product.image);
      return dedupeMedia([
        ...(primary ? [primary] : []),
        ...resolveMediaGallery(product.galleryMedia, product.gallery ?? []),
      ]);
    },
    [product.gallery, product.galleryMedia, product.image, product.primaryMedia],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [finish, setFinish] = useState("Collector finish");
  const [edition, setEdition] = useState("Single object");
  const noteWords = buildNoteWords(product);
  const shortStory = buildShortStory(product.story);
  const activeMedia = media[activeIndex] ?? media[0] ?? null;
  const collectionLabel =
    typeof product.collection === "string"
      ? product.collection
      : (product.collection as { title?: string })?.title || "LingTour Goods";

  return (
    <section className="overflow-hidden bg-[var(--paper-deep)] bg-grain pb-12 pt-8 lg:pb-20 lg:pt-12">
      <div className="border-y border-[rgba(20,33,47,0.1)] bg-[var(--paper-deep)] bg-grain py-4">
        <div className="site-container">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="handwritten text-lg text-[var(--gold)]">
                Studio dispatch
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)]/60">
                Free route-linked packing for this object.
              </span>
            </div>
            <nav aria-label="Product breadcrumb" className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)]/40">
              <Link href="/" className="hover:text-[var(--river-deep)] transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-[var(--river-deep)] transition-colors">Store</Link>
              <span>/</span>
              <span className="text-[var(--river-deep)]/80">{product.name}</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="site-container mt-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Details & Story */}
          <div className="lg:col-span-3 space-y-10">
            <Reveal>
              <div className="relative inline-block bg-[var(--river-deep)] p-6 scrapbook-shadow -rotate-2">
                <p className="handwritten text-xl text-[var(--gold)]">Collection</p>
                <p className="mt-2 font-[family:var(--font-display)] text-2xl text-white leading-tight">
                  {collectionLabel}
                </p>
                {/* Stamp effect */}
                <div className="absolute -right-4 -top-4 h-16 w-16 rotate-12 rounded-full border-2 border-dashed border-[var(--gold)]/30 flex items-center justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]/40 text-center">Authentic<br/>Object</span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="space-y-4">
                <h1 className="font-[family:var(--font-display)] text-5xl leading-[0.9] tracking-tight text-[var(--river-deep)] lg:text-6xl">
                  {product.name}
                </h1>
                <p className="handwritten text-2xl text-[var(--gold)]">
                  {product.tag}
                </p>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="space-y-4 border-t border-dashed border-[var(--river-deep)]/20 pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)]/40">Story Summary</p>
                <p className="text-base leading-relaxed text-[var(--river-deep)]/80 italic">
                  &ldquo;{shortStory}&rdquo;
                </p>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="space-y-4 border-t border-dashed border-[var(--river-deep)]/20 pt-8">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)]/40">Material Logic</p>
                <div className="flex flex-wrap gap-2">
                  {noteWords.map((word) => (
                    <span
                      key={word}
                      className="border border-[var(--river-deep)]/20 bg-white/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--river-deep)]"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Center Column: Main Image */}
          <div className="lg:col-span-5 relative">
            <Reveal delay={150}>
              <div className="relative aspect-[4/5] w-full bg-white p-12 scrapbook-shadow rotate-1">
                {/* Tape effect */}
                <div className="absolute -top-4 left-1/2 h-10 w-32 -translate-x-1/2 rotate-2 bg-white/40 backdrop-blur-sm border border-white/20" />

                <div className="relative flex h-full w-full items-center justify-center">
                  <MediaFrame
                    asset={activeMedia}
                    fallbackSrc={product.image}
                    alt={product.name}
                    mode={activeMedia?.type === "video" ? "interactive" : "image"}
                    eager
                    mediaClassName="object-contain transition-transform duration-700 hover:scale-105"
                  />

                  {/* Navigation Buttons */}
                  <button
                    type="button"
                    onClick={() => setActiveIndex((c) => (c === 0 ? media.length - 1 : c - 1))}
                    className="absolute -left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[var(--river-deep)] text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-20"
                    disabled={media.length <= 1}
                  >
                    <span className="text-2xl mt-[-2px] pr-[2px]">&#8249;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((c) => (c + 1) % Math.max(media.length, 1))}
                    className="absolute -right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-[var(--river-deep)] text-white flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-20"
                    disabled={media.length <= 1}
                  >
                    <span className="text-2xl mt-[-2px] pl-[2px]">&#8250;</span>
                  </button>
                </div>

                {/* Image counter */}
                <div className="absolute bottom-6 right-6 handwritten text-xl text-[var(--gold)]">
                  {media.length > 0 ? `${activeIndex + 1} / ${media.length}` : "—"}
                </div>
              </div>
            </Reveal>

            {/* Gallery Thumbs */}
            <div className="mt-12 flex justify-center gap-4">
              {media.map((asset, index) => (
                <button
                  key={`${asset.type}:${asset.url}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show ${asset.type} ${index + 1} of ${media.length}`}
                  className={`relative h-20 w-20 overflow-hidden border-4 transition-all ${
                    activeIndex === index
                      ? "border-[var(--gold)] rotate-2 scale-110 z-10 scrapbook-shadow"
                      : "border-white rotate-[-2deg] opacity-60 hover:opacity-100"
                  }`}
                >
                  <MediaFrame
                    asset={asset}
                    alt=""
                    mode="image"
                    mediaClassName="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Buying Options */}
          <div className="lg:col-span-4 lg:pl-8">
            <Reveal delay={250}>
              <div className="bg-white p-8 scrapbook-shadow rotate-[-1deg] space-y-8">
                <div className="space-y-2">
                  <p className="font-[family:var(--font-display)] text-6xl tracking-tight text-[var(--river-deep)]">
                    <Price amount={product.price} currency={product.currency} />
                  </p>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--river-deep)]/40 italic">Select Finish</p>
                  <div className="grid gap-2">
                    {["Collector finish", "Daily use finish"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setFinish(option)}
                        className={`group flex items-center justify-between border-2 px-5 py-3 transition-all ${
                          finish === option
                            ? "border-[var(--river-deep)] bg-[var(--river-deep)] text-white"
                            : "border-[var(--river-deep)]/10 text-[var(--river-deep)]/60 hover:border-[var(--river-deep)]/30"
                        }`}
                      >
                        <span className="text-sm font-bold uppercase tracking-widest">{option}</span>
                        {finish === option && <span className="handwritten text-lg text-[var(--gold)]">Picked</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--river-deep)]/40 italic">Choose Edition</p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Single object", "Gift set"].map((option) => (
                      <button
                        key={option}
                        onClick={() => setEdition(option)}
                        className={`border-2 py-3 transition-all text-xs font-bold uppercase tracking-widest ${
                          edition === option
                            ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--river-deep)]"
                            : "border-[var(--river-deep)]/10 text-[var(--river-deep)]/60 hover:border-[var(--river-deep)]/30"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <ProductActions product={product} variant="editorial" />
                </div>

                <div className="grid gap-3 border-t border-dashed border-[var(--river-deep)]/18 pt-5">
                  <Link
                    href="/routes"
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--river-deep)] underline-offset-4 hover:text-[var(--cinnabar)] hover:underline"
                  >
                    Trace the route behind this object
                  </Link>
                  <Link
                    href={`/community?compose=1&channel=Culture%20Desk&title=${encodeURIComponent(product.name)}&note=${encodeURIComponent(`Object note: ${product.name} belongs in the field archive because `)}`}
                    className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--gold)] underline-offset-4 hover:text-[var(--cinnabar)] hover:underline"
                  >
                    Send this object to the community desk
                  </Link>
                </div>

                <div className="flex items-center gap-4 pt-4 text-[10px] font-bold uppercase tracking-widest text-[var(--river-deep)]/30 italic">
                  <div className="h-[1px] flex-1 bg-[var(--river-deep)]/10" />
                  <span>Registry #LT-{product.slug.slice(0, 4).toUpperCase()}</span>
                  <div className="h-[1px] flex-1 bg-[var(--river-deep)]/10" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
