"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";

type ShopProductImageProps = {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  imageClassName?: string;
};

export function ShopProductImage({
  src,
  fallbackSrc,
  alt,
  className = "",
  imageClassName = "",
}: ShopProductImageProps) {
  const { t } = useLocale();
  const sources = [src, fallbackSrc].filter(
    (value, index, values): value is string =>
      Boolean(value?.trim()) && values.indexOf(value) === index,
  );
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [src, fallbackSrc]);

  const activeSource = sources[sourceIndex];

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      {activeSource ? (
        <img
          src={activeSource}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((index) => index + 1)}
          className={`h-full w-full ${imageClassName}`}
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt}. ${t("shop.image.pending")}`}
          className="absolute inset-0 grid place-items-center border border-dashed border-[var(--line)] bg-[var(--paper)] px-6 text-center"
        >
          <div className="max-w-[18rem]">
            <span className="mx-auto block h-px w-10 bg-[var(--gold)]" />
            <p className="mt-4 font-[family:var(--font-display)] text-lg italic leading-snug text-[var(--river-deep)]">
              {t("shop.image.pending")}
            </p>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
              {t("shop.image.catalogueNote")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
