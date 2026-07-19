"use client";

import Link from "next/link";
import { useRef } from "react";
import type { StoreProduct } from "@/data/store";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { Price } from "@/components/ui/Price";
import { gsap, motionEase, useGSAP } from "@/lib/motion";

type ShopGalleryHeroProps = {
  image: string;
  eyebrow: string;
  title: string;
  accent: string;
  lede: string;
  craftedLabel: string;
  collectionCount: number;
  featured?: StoreProduct;
};

export function ShopGalleryHero({
  image,
  eyebrow,
  title,
  accent,
  lede,
  craftedLabel,
  collectionCount,
  featured,
}: ShopGalleryHeroProps) {
  const scope = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const timeline = gsap.timeline({ defaults: { ease: motionEase.enter } });
        timeline
          .fromTo(
            "[data-shop-copy] > *",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.72, stagger: 0.075 },
          )
          .fromTo(
            "[data-shop-stage]",
            { autoAlpha: 0, scale: 0.96, rotate: 1.2 },
            { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.95, ease: "expo.out" },
            "-=0.5",
          )
          .fromTo(
            "[data-shop-ticket]",
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
            "-=0.32",
          );
      });

      return () => media.revert();
    },
    { scope },
  );

  const productHref = featured ? `/shop/products/${featured.slug}` : "/shop/products";

  return (
    <section ref={scope} className="relative overflow-hidden border-b border-[var(--line)] bg-[#f0eee8] py-12 sm:py-18 lg:py-24">
      <div className="site-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.86fr)_minmax(28rem,1.14fr)] lg:items-center lg:gap-16">
          <div data-shop-copy className="max-w-2xl">
            <p className="lt-kicker">{eyebrow}</p>
            <h1 className="mt-8 font-[family:var(--font-display)] text-[clamp(3.25rem,7vw,7.25rem)] leading-[0.84] tracking-[-0.065em] text-[var(--river-deep)]">
              {title}
              <span className="mt-1 block italic text-[var(--gold)]">{accent}</span>
            </h1>
            <p className="mt-7 max-w-[36rem] text-sm leading-7 text-[var(--muted)] sm:text-base lg:mt-9">
              {lede}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop/products" className="lt-action lt-action-primary">
                Browse objects <span aria-hidden>↗</span>
              </Link>
              <a href="#shop-collections" className="lt-action lt-action-secondary">
                {collectionCount} {collectionCount === 1 ? "collection" : "collections"}
              </a>
            </div>
          </div>

          <div data-shop-stage className="relative min-w-0 pb-8 sm:pb-10">
            <Link
              href={productHref}
              className="group relative block aspect-[16/12] overflow-hidden rounded-[var(--radius-xl)] bg-[var(--night)] shadow-[0_32px_100px_rgba(17,25,35,0.2)] sm:aspect-[16/11]"
            >
              <div className="absolute inset-5 overflow-hidden rounded-[calc(var(--radius-xl)-0.4rem)] bg-[#e8e2d7] sm:inset-8">
                <MediaFrame
                  asset={featured?.primaryMedia}
                  fallbackSrc={featured?.image || image}
                  alt={featured?.name || craftedLabel}
                  mode="preview"
                  eager
                  mediaClassName="object-cover transition duration-1000 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_48%)]" />
              </div>

              <div className="absolute left-3 top-3 rounded-full border border-white/18 bg-black/35 px-3 py-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md sm:left-5 sm:top-5">
                {craftedLabel}
              </div>
              <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white text-[var(--night)] transition group-hover:translate-x-1 group-hover:bg-[var(--gold)] sm:bottom-6 sm:right-6">
                ↗
              </span>
            </Link>

            <div
              data-shop-ticket
              className="absolute -bottom-1 left-4 right-4 flex items-end justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-strong)] px-5 py-4 shadow-[0_18px_48px_rgba(17,25,35,0.14)] sm:left-10 sm:right-auto sm:min-w-[20rem]"
            >
              <div className="min-w-0">
                <p className="font-mono text-[8px] uppercase tracking-[0.22em] text-[var(--muted)]">Featured object</p>
                <p className="mt-1 truncate font-[family:var(--font-display)] text-xl text-[var(--river-deep)] sm:text-2xl">
                  {featured?.name || craftedLabel}
                </p>
              </div>
              {featured ? (
                <p className="shrink-0 font-[family:var(--font-display)] text-lg text-[var(--gold)]">
                  <Price amount={featured.price} currency={featured.currency} />
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
