"use client";

import Link from "next/link";
import type { CultureFeature } from "@/types/content";

interface Props {
  highlights?: CultureFeature[];
}

const defaultGallery = [
  {
    slug: "zhanjiang",
    href: "/culture/zhanjiang",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
    place: "Coast, seafood, volcanic",
  },
];

function stripMarkdown(text: string): string {
  return text.replace(/^#{1,3}\s+/gm, "").replace(/\*{1,3}(.+?)\*{1,3}/g, "$1");
}

export function CultureGallery({ highlights = [] }: Props) {
  const galleryItems = highlights.length > 0
    ? highlights.map((culture) => {
        const gallery = defaultGallery.find((item) => item.slug === culture.slug);
        return {
          ...culture,
          href: culture.href || gallery?.href || `/culture/${culture.slug}`,
          image: gallery?.image || "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=82",
          place: culture.title || gallery?.place || "Lingnan culture",
        };
      })
    : defaultGallery.map((item) => ({
        slug: item.slug,
        title: "Lingnan Culture",
        body: "Explore the cultural layers of Guangdong, city by city.",
        href: item.href,
        image: item.image,
        place: item.place,
      }));

  return (
    <div className="grid gap-x-12 gap-y-20 md:grid-cols-2">
      {galleryItems.map((item, idx) => (
        <Link
          key={item.slug}
          href={item.href}
          className={`group relative transition-all duration-500 hover:-translate-y-2 ${
            idx % 2 === 0 ? "-rotate-1" : "rotate-1"
          }`}
        >
          <div className="relative aspect-[3/2] scrapbook-shadow border-[0.75rem] border-white overflow-hidden bg-white">
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
              style={{ backgroundImage: `url(${item.image})` }}
            />
            <div className="absolute inset-0 bg-black/5" />

            {/* Tape decoration */}
            <div className="absolute -top-3 left-1/4 w-16 h-6 bg-white/30 backdrop-blur-sm rotate-3 z-20" />
          </div>

          <div className="mt-8 space-y-4 px-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-[var(--gold)]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                {item.place}
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
              <svg className="h-3 w-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
