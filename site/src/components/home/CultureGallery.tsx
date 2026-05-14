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
    <div className="grid gap-6 md:grid-cols-2">
      {galleryItems.map((item) => (
        <Link
          key={item.slug}
          href={item.href}
          className="group relative overflow-hidden rounded-xl bg-[var(--night)] shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[0_24px_70px_rgba(17,25,35,0.12)]"
        >
          <div
            className="aspect-[3/2] bg-cover bg-center transition duration-1000 group-hover:scale-105"
            style={{ backgroundImage: `url(${item.image})` }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0),rgba(17,25,35,0.05)_50%,rgba(17,25,35,0.88))]" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
              {item.place}
            </p>
            <h3 className="mt-2 font-[family:var(--font-display)] text-xl leading-tight">
              {item.title}
            </h3>
            <div className="mt-4 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-48 group-hover:opacity-100">
              <p className="text-sm leading-7 text-white/75 line-clamp-3">
                {stripMarkdown(item.body)}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                Read culture notes
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
