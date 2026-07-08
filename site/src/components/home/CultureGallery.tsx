"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import type { CultureFeature } from "@/types/content";
import { placeholderFor } from "@/lib/placeholders";

interface Props {
  highlights?: CultureFeature[];
}

/**
 * Gallery of culture-line entry points for the home page.
 *
 * Each item is driven entirely by the API-provided `CultureFeature`. We do
 * NOT keep any local fallback images here — if the field is empty we use a
 * Journal-style placeholder, which is editable by ops via the admin UI.
 */
export function CultureGallery({ highlights = [] }: Props) {
  const { t } = useLocale();

  if (!highlights.length) {
    return (
      <div className="scrapbook-shadow mx-auto max-w-2xl rotate-1 border border-[var(--line)] bg-white/70 p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
          {t("culture.atlas.eyebrow")}
        </p>
        <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
          {t("culture.atlas.empty.title")}
        </h3>
        <p className="handwritten mt-4 text-lg leading-relaxed text-[var(--muted)]">
          {t("culture.atlas.empty.body")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-x-12 gap-y-14 md:grid-cols-2 md:gap-y-20">
      {highlights.map((item, idx) => {
        const image = item.image || placeholderFor("hero");
        const place = item.place || item.title || "Lingnan culture";
        return (
          <Link
            key={item.slug}
            href={item.href ?? `/culture/${item.slug}`}
            className={`group relative transition-all duration-500 hover:-translate-y-2 ${
              idx % 2 === 0 ? "md:-rotate-1" : "md:rotate-1"
            }`}
          >
            <div className="relative aspect-[3/2] tape-effect">
              <div className="absolute inset-0 scrapbook-shadow border-[0.75rem] border-white overflow-hidden bg-white">
                <div
                  className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
                  style={{ backgroundImage: `url(${image})` }}
                />
                <div className="absolute inset-0 bg-black/5" />
              </div>
            </div>

            <div className="mt-8 space-y-4 px-2">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-[var(--gold)]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                  {place}
                </p>
              </div>

              <h3 className="font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)] sm:text-4xl">
                {item.title}
              </h3>

              <div className="pt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                <span>{t("culture.atlas.openArchive")}</span>
                <svg
                  className="h-3 w-3 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
