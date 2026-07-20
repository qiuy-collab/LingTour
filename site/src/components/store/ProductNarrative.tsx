"use client";

import Link from "next/link";
import type { StoreProduct } from "@/data/store";
import { Reveal } from "@/components/ui/Reveal";
import { MediaFrame } from "@/components/ui/MediaFrame";
import { useLocale } from "@/lib/locale-context";
import {
  dedupeMedia,
  resolveMediaGallery,
  resolvePrimaryMedia,
} from "@/types/media";

export function ProductNarrative({ product }: { product: StoreProduct }) {
  const { t } = useLocale();
  const collectionLabel = product.collection || t("shop.detail.collectionFallback");
  const materialLine = product.materialNotes || t("shop.detail.materialPending");
  const primary = resolvePrimaryMedia(product.primaryMedia, product.image);
  const media = dedupeMedia([
    ...(primary ? [primary] : []),
    ...resolveMediaGallery(product.galleryMedia, product.gallery ?? []),
  ]);
  const narrativeMedia = media[1] ?? media[0] ?? null;

  return (
    <section className="border-y border-[var(--river-deep)]/10 bg-[var(--paper-deep)] bg-grain py-16 sm:py-20 lg:py-28 xl:py-32">
      <div className="site-container">
        <div className="grid min-w-0 gap-12 min-[620px]:grid-cols-[minmax(0,1.25fr)_minmax(14rem,0.75fr)] min-[620px]:items-center min-[620px]:gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] lg:gap-16">
          <Reveal>
            <div className="max-w-2xl space-y-7 sm:space-y-8">
              <header>
                <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--gold)] sm:text-[10px] sm:tracking-[0.24em]">
                  {t("shop.detail.provenance")}
                </p>
                <h2 className="mt-4 max-w-[14ch] font-[family:var(--font-display)] text-4xl leading-[0.98] text-[var(--river-deep)] sm:text-5xl md:text-6xl">
                  {product.name}
                </h2>
              </header>

              <p className="max-w-[62ch] text-base leading-8 text-[var(--river-deep)]/76 sm:text-lg">
                {product.story}
              </p>

              <dl className="grid border-y border-[var(--line)] sm:grid-cols-2">
                <div className="border-b border-[var(--line)] py-5 sm:border-b-0 sm:border-r sm:pr-6">
                  <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[9px]">{t("shop.detail.collection")}</dt>
                  <dd className="mt-2 text-[15px] text-[var(--river-deep)] sm:text-base">{collectionLabel}</dd>
                </div>
                <div className="border-b border-[var(--line)] py-5 sm:border-b-0 sm:pl-6">
                  <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[9px]">{t("shop.detail.category")}</dt>
                  <dd className="mt-2 text-[15px] text-[var(--river-deep)] sm:text-base">{product.tag}</dd>
                </div>
                <div className="border-t border-[var(--line)] py-5 sm:col-span-2">
                  <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] sm:text-[9px]">{t("shop.detail.material")}</dt>
                  <dd className="mt-2 text-[15px] leading-7 text-[var(--river-deep)] sm:text-base">{materialLine}</dd>
                </div>
              </dl>

              <div className="grid gap-3 pt-1 sm:flex sm:flex-wrap sm:gap-4">
                <Link href="/routes" className="btn-paper min-h-12 w-full px-6 py-3 text-[10px] sm:w-auto sm:text-[11px]">
                  {t("shop.detail.routesCta")}
                </Link>
                <Link href="/culture" className="btn-outline min-h-12 w-full px-6 py-3 text-[10px] sm:w-auto sm:text-[11px]">
                  {t("shop.detail.citiesCta")}
                </Link>
                <Link
                  href={`/community?compose=1&channel=Culture%20Desk&title=${encodeURIComponent(product.name)}&note=${encodeURIComponent(`Object note: ${product.name} feels worth recording because `)}`}
                  className="btn-gold min-h-12 w-full px-6 py-3 text-[10px] sm:w-auto sm:text-[11px]"
                >
                  {t("shop.detail.noteCta")}
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-xl rotate-2 bg-white p-4 scrapbook-shadow sm:aspect-[3/4] sm:max-w-md sm:p-6 lg:max-w-none">
              <div className="absolute -top-3 right-8 z-20 h-8 w-24 rotate-12 border border-white/20 bg-white/45 backdrop-blur-sm sm:right-12" />
              <div className="relative h-full w-full overflow-hidden">
                <MediaFrame
                  asset={narrativeMedia}
                  fallbackSrc={product.image}
                  alt={`${product.name} provenance`}
                  mode={narrativeMedia?.type === "video" ? "interactive" : "image"}
                  mediaClassName="object-cover grayscale transition duration-1000 hover:scale-105 hover:grayscale-0"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_46%,rgba(17,25,35,0.48))]" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] sm:text-[10px]">
                    {collectionLabel}
                  </p>
                  <p className="mt-2 max-w-[18ch] font-[family:var(--font-display)] text-2xl leading-tight sm:text-3xl">
                    {product.tag}
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
