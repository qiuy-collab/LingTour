"use client";

import { useState } from "react";
import Link from "next/link";
import { cultureHighlights } from "@/data/home";

const cultureGallery = [
  {
    slug: "guangfu",
    href: "/culture/guangzhou",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Foshan%20Ancestral%20Temple%200.jpg?width=1200",
    place: "Arcades, opera, craft",
  },
  {
    slug: "chaoshan",
    href: "/culture/chaozhou",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1200&q=82",
    place: "Tea, ritual, harbor",
  },
  {
    slug: "hakka",
    href: "/culture/meizhou",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=82",
    place: "Home, migration, mountain",
  },
];

const galleryItems = cultureHighlights.map((culture) => {
  const gallery = cultureGallery.find((item) => item.slug === culture.slug);

  return {
    ...culture,
    href: gallery?.href ?? "/culture",
    image: gallery?.image ?? "https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1200&q=82",
    place: gallery?.place ?? "Lingnan culture",
  };
});

export function CultureGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const maxIndex = galleryItems.length - 1;

  function showNext() {
    setActiveIndex((current) => (current >= maxIndex ? 0 : current + 1));
  }

  function showPrevious() {
    setActiveIndex((current) => Math.max(current - 1, 0));
  }

  return (
    <section className="overflow-hidden bg-[var(--river-deep)] py-16 text-white lg:py-24">
      <div
        className="site-container grid gap-10 lg:grid-cols-[0.62fr_0.38fr] lg:items-center"
        data-carousel-root
        data-carousel-index="0"
        data-carousel-max={maxIndex}
        data-carousel-step="auto"
        data-carousel-copy-step="100%"
      >
        <div className="relative overflow-hidden pr-10 sm:pr-16">
          <div
            data-carousel-track
            className="flex gap-5 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activeIndex * 21.25}rem)` }}
          >
            {galleryItems.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className="group relative h-[28rem] w-[17.5rem] shrink-0 overflow-hidden bg-black text-white sm:h-[34rem] sm:w-[20rem]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-82 transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.26)_42%,rgba(0,0,0,0.88))]" />
                <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
                  <p className="self-end text-sm font-bold uppercase">{item.place}</p>
                  <div>
                    <p className="text-sm font-bold uppercase text-white/80">Lingnan culture</p>
                    <h3 className="mt-3 font-[family:var(--font-display)] text-3xl leading-tight sm:text-4xl">{item.title}</h3>
                    <div className="mt-4 max-h-64 translate-y-0 overflow-hidden opacity-100 transition-all duration-500 md:max-h-0 md:translate-y-8 md:opacity-0 md:group-hover:max-h-64 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                      <p className="text-sm leading-7 text-white/82">{item.body}</p>
                      <span className="mt-5 inline-block border border-white/70 px-5 py-3 text-sm font-semibold">
                        Read culture notes
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            type="button"
            data-carousel-prev
            hidden={activeIndex <= 0}
            aria-label="Show previous culture"
            className="absolute right-3 top-1/2 z-20 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/28 bg-white/12 text-white backdrop-blur transition hover:bg-white hover:text-[var(--night)]"
            onClick={showPrevious}
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M8 5L15 12L8 19"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <button
            type="button"
            data-carousel-next
            aria-label="Show next culture"
            className="absolute left-3 top-1/2 z-20 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/28 bg-white/12 text-white backdrop-blur transition hover:bg-white hover:text-[var(--night)]"
            onClick={showNext}
          >
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M16 5L9 12L16 19"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="relative overflow-hidden lg:pl-4">
          <div className="absolute -right-24 top-16 hidden h-80 w-80 rounded-[45%] border border-white/8 lg:block" />
          <div
            data-carousel-copy-track
            className="relative z-10 flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {galleryItems.map((item, index) => (
              <div key={item.slug} className="w-full shrink-0">
                <p className="text-label text-white/54">
                  {index === 0 ? "Lingnan culture" : item.place}
                </p>
                <h2 className="mt-5 max-w-[15ch] font-[family:var(--font-display)] text-4xl leading-[1.08] text-white md:mt-7 md:text-5xl">
                  {index === 0 ? "Culture lines" : item.title}
                </h2>
                <p className="mt-6 max-w-sm border-l border-white/16 pl-5 text-base leading-8 text-white/72 md:mt-10 md:pl-7 md:leading-9">{item.body}</p>
                <Link
                  href={item.href}
                  className="mt-8 inline-block border border-white/24 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[var(--night)] md:mt-12"
                >
                  Read culture notes
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
