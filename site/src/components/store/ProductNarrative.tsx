"use client";

import Link from "next/link";
import { type StoreProduct } from "@/data/store";
import { Reveal } from "@/components/ui/Reveal";
import { useLocale } from "@/lib/locale-context";

type ProductNarrativeProps = {
  product: StoreProduct;
};

export function ProductNarrative({ product }: ProductNarrativeProps) {
  const { t } = useLocale();
  const collectionLabel =
    typeof product.collection === "string"
      ? product.collection
      : t("shop.detail.collectionFallback");
  const materialLine = product.materialNotes || t("shop.detail.materialPending");

  return (
    <section className="bg-[var(--paper-deep)] bg-grain py-24 lg:py-32 border-y border-[var(--river-deep)]/10">
      <div className="site-container">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <Reveal>
            <div className="max-w-2xl space-y-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
                  {t("shop.detail.provenance")}
                </p>
                <h2 className="mt-4 font-[family:var(--font-display)] text-5xl leading-tight text-[var(--river-deep)] md:text-6xl">
                  {product.name}
                </h2>
              </div>

              <p className="max-w-[62ch] text-lg leading-8 text-[var(--river-deep)]/76">
                {product.story}
              </p>

              <dl className="grid border-y border-[var(--line)] sm:grid-cols-2">
                <div className="border-b border-[var(--line)] py-5 sm:border-b-0 sm:border-r sm:pr-6">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("shop.detail.collection")}</dt>
                  <dd className="mt-2 text-base text-[var(--river-deep)]">{collectionLabel}</dd>
                </div>
                <div className="py-5 sm:pl-6">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("shop.detail.category")}</dt>
                  <dd className="mt-2 text-base text-[var(--river-deep)]">{product.tag}</dd>
                </div>
                <div className="border-t border-[var(--line)] py-5 sm:col-span-2">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("shop.detail.material")}</dt>
                  <dd className="mt-2 text-base leading-7 text-[var(--river-deep)]">{materialLine}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/routes"
                  className="btn-paper px-6 py-3 text-[11px]"
                >
                  {t("shop.detail.routesCta")}
                </Link>
                <Link
                  href="/culture"
                  className="btn-outline px-6 py-3 text-[11px]"
                >
                  {t("shop.detail.citiesCta")}
                </Link>
                <Link
                  href={`/community?compose=1&channel=Culture%20Desk&title=${encodeURIComponent(product.name)}&note=${encodeURIComponent(`Object note: ${product.name} feels worth recording because `)}`}
                  className="btn-gold px-6 py-3 text-[11px]"
                >
                  {t("shop.detail.noteCta")}
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative aspect-[3/4] w-full bg-white p-6 scrapbook-shadow rotate-2">
              {/* Tape effect */}
              <div className="absolute -top-3 right-12 h-8 w-24 rotate-12 bg-white/40 backdrop-blur-sm border border-white/20 z-10" />

              <div className="relative h-full w-full overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center grayscale transition duration-1000 hover:scale-105 hover:grayscale-0"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(17,25,35,0.4))] " />
                <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                    {collectionLabel}
                  </p>
                  <p className="mt-2 font-[family:var(--font-display)] text-2xl leading-tight">
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
