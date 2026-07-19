"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { StoreProduct } from "@/data/store";
import { ProductActions } from "@/components/store/ProductActions";
import { Price } from "@/components/ui/Price";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Reveal } from "@/components/ui/Reveal";
import {
  dedupeMedia,
  resolveMediaGallery,
  resolvePrimaryMedia,
} from "@/types/media";

function buildNoteWords(product: StoreProduct) {
  return Array.from(
    new Set(
      [product.tag, product.materialNotes]
        .filter(Boolean)
        .join(" ")
        .replace(/[^a-zA-Z\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 3),
    ),
  ).slice(0, 4);
}

function buildShortStory(story: string) {
  const trimmed = story.trim();
  const firstSentence = trimmed.split(/(?<=[.!?])\s+/)[0] || trimmed;
  return firstSentence.length > 180
    ? `${firstSentence.slice(0, 177).trim()}…`
    : firstSentence;
}

export function ProductDetailHero({ product }: { product: StoreProduct }) {
  const media = useMemo(() => {
    const primary = resolvePrimaryMedia(product.primaryMedia, product.image);
    return dedupeMedia([
      ...(primary ? [primary] : []),
      ...resolveMediaGallery(product.galleryMedia, product.gallery ?? []),
    ]);
  }, [product.gallery, product.galleryMedia, product.image, product.primaryMedia]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [finish, setFinish] = useState("Collector finish");
  const [edition, setEdition] = useState("Single object");
  const activeMedia = media[activeIndex] ?? media[0] ?? null;
  const noteWords = buildNoteWords(product);
  const collectionLabel = product.collection || "LingTour Goods";

  const showPrevious = () => {
    if (media.length <= 1) return;
    setActiveIndex((current) => (current === 0 ? media.length - 1 : current - 1));
  };
  const showNext = () => {
    if (media.length <= 1) return;
    setActiveIndex((current) => (current + 1) % media.length);
  };

  return (
    <section className="overflow-hidden bg-[var(--paper-deep)] bg-grain pb-14 pt-7 sm:pb-16 lg:pb-24 lg:pt-10">
      <div className="site-container">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
          <nav aria-label="Product breadcrumb" className="flex min-w-0 items-center gap-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
            <Link href="/shop" className="transition hover:text-[var(--cinnabar)]">Store</Link>
            <span aria-hidden>/</span>
            <span className="truncate text-[var(--river-deep)]">{product.name}</span>
          </nav>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
            Studio dispatch · Route-linked packing
          </p>
        </div>

        <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-8">
          <Reveal className="min-w-0 lg:col-start-8 lg:col-span-5 lg:row-start-1">
            <header>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--river-deep)] px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white">
                  {collectionLabel}
                </span>
                {product.tag ? (
                  <span className="rounded-full border border-[var(--line)] bg-white/62 px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                    {product.tag}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-6 font-[family:var(--font-display)] text-[clamp(3.35rem,6.2vw,6.4rem)] leading-[0.86] tracking-[-0.06em] text-[var(--river-deep)]">
                {product.name}
              </h1>
              <p className="mt-6 max-w-[36rem] text-base leading-7 text-[var(--muted)]">
                {buildShortStory(product.story)}
              </p>
              {noteWords.length ? (
                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {noteWords.map((word) => (
                    <span key={word} className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
                      {word}
                    </span>
                  ))}
                </div>
              ) : null}
            </header>
          </Reveal>

          <Reveal delay={80} className="min-w-0 lg:col-span-7 lg:row-span-2 lg:row-start-1">
            <div className="min-w-0">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_80px_rgba(17,25,35,0.1)] sm:aspect-[5/4]">
                <MediaFrame
                  asset={activeMedia}
                  fallbackSrc={product.image}
                  alt={product.name}
                  mode={activeMedia?.type === "video" ? "interactive" : "image"}
                  eager
                  mediaClassName="object-contain p-7 transition-transform duration-700 sm:p-12 lg:p-14"
                />

                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-4 p-4 sm:p-5">
                  <span className="rounded-full border border-[var(--line)] bg-white/76 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--river-deep)] backdrop-blur-md">
                    Object view
                  </span>
                  <span className="rounded-full border border-[var(--line)] bg-white/76 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--muted)] backdrop-blur-md">
                    {media.length ? `${String(activeIndex + 1).padStart(2, "0")} / ${String(media.length).padStart(2, "0")}` : "01 / 01"}
                  </span>
                </div>

                {media.length > 1 ? (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 sm:p-5">
                    <button
                      type="button"
                      onClick={showPrevious}
                      aria-label="Show previous product media"
                      className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-white/86 text-lg text-[var(--river-deep)] shadow-lg backdrop-blur-md transition hover:bg-[var(--river-deep)] hover:text-white"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={showNext}
                      aria-label="Show next product media"
                      className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-white/86 text-lg text-[var(--river-deep)] shadow-lg backdrop-blur-md transition hover:bg-[var(--river-deep)] hover:text-white"
                    >
                      →
                    </button>
                  </div>
                ) : null}
              </div>

              {media.length > 1 ? (
                <div className="scrollbar-hide mt-4 flex gap-3 overflow-x-auto pb-1">
                  {media.map((asset, index) => (
                    <button
                      key={`${asset.type}:${asset.url}`}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`Show ${asset.type} ${index + 1} of ${media.length}`}
                      aria-pressed={activeIndex === index}
                      className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-2 bg-white transition ${
                        activeIndex === index
                          ? "border-[var(--cinnabar)] opacity-100"
                          : "border-transparent opacity-55 hover:opacity-100"
                      }`}
                    >
                      <MediaFrame asset={asset} alt="" mode="image" mediaClassName="object-cover" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={140} className="min-w-0 lg:col-start-8 lg:col-span-5 lg:row-start-2">
            <aside className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_20px_70px_rgba(17,25,35,0.08)] sm:p-7">
              <div className="flex items-end justify-between gap-5 border-b border-[var(--line)] pb-5">
                <div>
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Collector price</p>
                  <p className="mt-2 font-[family:var(--font-display)] text-4xl leading-none text-[var(--river-deep)] sm:text-5xl">
                    <Price amount={product.price} currency={product.currency} />
                  </p>
                </div>
                <span className="rounded-full bg-[var(--gold)]/12 px-3 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-[var(--gold)]">In archive</span>
              </div>

              <div className="mt-6 grid gap-6">
                <fieldset>
                  <legend className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Select finish</legend>
                  <div className="mt-3 grid gap-2">
                    {["Collector finish", "Daily use finish"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFinish(option)}
                        aria-pressed={finish === option}
                        className={`flex min-h-12 items-center justify-between rounded-[var(--radius-sm)] border px-4 py-3 text-left font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition ${
                          finish === option
                            ? "border-[var(--river-deep)] bg-[var(--river-deep)] text-white"
                            : "border-[var(--line)] text-[var(--river-deep)] hover:border-[var(--river-deep)]"
                        }`}
                      >
                        {option}
                        <span className={`h-2 w-2 rounded-full ${finish === option ? "bg-[var(--gold)]" : "bg-[var(--line)]"}`} />
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Choose edition</legend>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {["Single object", "Gift set"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setEdition(option)}
                        aria-pressed={edition === option}
                        className={`min-h-12 rounded-[var(--radius-sm)] border px-3 py-3 font-mono text-[8px] font-bold uppercase tracking-[0.14em] transition ${
                          edition === option
                            ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--night)]"
                            : "border-[var(--line)] text-[var(--river-deep)] hover:border-[var(--river-deep)]"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <div className="mt-6">
                <ProductActions product={product} variant="editorial" />
              </div>

              <div className="mt-6 grid gap-3 border-t border-[var(--line)] pt-5">
                <Link href="/routes" className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--river-deep)] transition hover:text-[var(--cinnabar)]">
                  Trace the route behind this object →
                </Link>
                <Link
                  href={`/community?compose=1&channel=Culture%20Desk&title=${encodeURIComponent(product.name)}&note=${encodeURIComponent(`Object note: ${product.name} belongs in the field archive because `)}`}
                  className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] transition hover:text-[var(--cinnabar)]"
                >
                  Send to the community desk →
                </Link>
              </div>
              <p className="mt-5 border-t border-[var(--line)] pt-4 text-center font-mono text-[7px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                Registry #LT-{product.slug.slice(0, 4).toUpperCase()}
              </p>
            </aside>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
