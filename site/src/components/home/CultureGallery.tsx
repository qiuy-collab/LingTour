"use client";

import Link from "next/link";
import type { CultureFeature } from "@/types/content";
import { placeholderFor } from "@/lib/placeholders";

interface Props {
  highlights?: CultureFeature[];
}

function stripMarkdown(text: string): string {
  return text.replace(/^#{1,3}\s+/gm, "").replace(/\*{1,3}(.+?)\*{1,3}/g, "$1");
}

/**
 * Gallery of culture-line entry points for the home page.
 *
 * Each item is driven entirely by the API-provided `CultureFeature`. We do
 * NOT keep any local fallback images here — if the field is empty we use a
 * Journal-style placeholder, which is editable by ops via the admin UI.
 */
export function CultureGallery({ highlights = [] }: Props) {
  if (!highlights.length) {
    return (
      <div className="scrapbook-shadow mx-auto max-w-2xl rotate-1 border border-[var(--line)] bg-white/70 p-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">
          Culture Atlas
        </p>
        <h3 className="mt-4 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
          The atlas is opening.
        </h3>
        <p className="handwritten mt-4 text-lg leading-relaxed text-[var(--muted)]">
          City highlights appear here once the editorial team curates them.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-x-12 gap-y-20 md:grid-cols-2">
      {highlights.map((item, idx) => {
        const image = item.image || placeholderFor("hero");
        const place = item.place || item.title || "Lingnan culture";
        return (
          <Link
            key={item.slug}
            href={item.href ?? `/culture/${item.slug}`}
            className={`group relative transition-all duration-500 hover:-translate-y-2 ${
              idx % 2 === 0 ? "-rotate-1" : "rotate-1"
            }`}
          >
            <div className="relative aspect-[3/2] scrapbook-shadow border-[0.75rem] border-white overflow-hidden bg-white">
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
                style={{ backgroundImage: `url(${image})` }}
              />
              <div className="absolute inset-0 bg-black/5" />

              {/* Tape decoration */}
              <div className="absolute -top-3 left-1/4 w-16 h-6 bg-white/30 backdrop-blur-sm rotate-3 z-20" />
            </div>

            <div className="mt-8 space-y-4 px-2">
              <div className="flex items-center gap-3">
                <div className="h-px w-6 bg-[var(--gold)]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                  {place}
                </p>
              </div>

              <h3 className="font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] group-hover:text-[var(--cinnabar)] transition-colors">
                {item.title}
              </h3>

              <p className="text-sm leading-relaxed text-[var(--muted)] handwritten max-w-[30ch]">
                {stripMarkdown(item.body)}
              </p>

              <div className="pt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                <span>View archive</span>
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
