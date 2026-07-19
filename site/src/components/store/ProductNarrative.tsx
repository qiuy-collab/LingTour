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
    <section className="border-y border-[var(--line)] bg-[var(--paper)] py-16 sm:py-20 lg:py-24">
      <div className="site-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(24rem,0.95fr)] lg:items-center lg:gap-16">
          <Reveal>
            <div className="max-w-[48rem]">
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
                {t("shop.detail.provenance")}
              </p>
              <h2 className="mt-5 max-w-[12ch] font-[family:var(--font-display)] text-4xl leading-[0.96] tracking-[-0.04em] text-[var(--river-deep)] sm:text-5xl lg:text-6xl">
                The story carried by this object.
              </h2>
              <p className="mt-7 max-w-[62ch] text-base leading-8 text-[var(--river-deep)]/74 lg:text-lg">
                {product.story}
              </p>

              <dl className="mt-8 grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/56 sm:grid-cols-2">
                <div className="border-b border-[var(--line)] p-5 sm:border-b-0 sm:border-r">
                  <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("shop.detail.collection")}</dt>
                  <dd className="mt-2 text-base text-[var(--river-deep)]">{collectionLabel}</dd>
                </div>
                <div className="border-b border-[var(--line)] p-5 sm:border-b-0">
                  <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("shop.detail.category")}</dt>
                  <dd className="mt-2 text-base text-[var(--river-deep)]">{product.tag}</dd>
                </div>
                <div className="border-t border-[var(--line)] p-5 sm:col-span-2">
                  <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("shop.detail.material")}</dt>
                  <dd className="mt-2 text-base leading-7 text-[var(--river-deep)]">{materialLine}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/routes" className="lt-action lt-action-primary">{t("shop.detail.routesCta")}</Link>
                <Link href="/culture" className="lt-action lt-action-secondary">{t("shop.detail.citiesCta")}</Link>
                <Link
                  href={`/community?compose=1&channel=Culture%20Desk&title=${encodeURIComponent(product.name)}&note=${encodeURIComponent(`Object note: ${product.name} feels worth recording because `)}`}
                  className="lt-action lt-action-gold"
                >
                  {t("shop.detail.noteCta")}
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={110}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_24px_80px_rgba(17,25,35,0.12)] sm:aspect-[5/4]">
              <MediaFrame
                asset={narrativeMedia}
                fallbackSrc={product.image}
                alt={`${product.name} provenance`}
                mode={narrativeMedia?.type === "video" ? "interactive" : "image"}
                mediaClassName="object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_54%,rgba(7,16,22,0.72))]" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{collectionLabel}</p>
                <p className="mt-2 max-w-[18ch] font-[family:var(--font-display)] text-2xl leading-none sm:text-3xl">{product.tag}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
