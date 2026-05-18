"use client";

import { useState } from "react";
import Link from "next/link";
import type { StoryRoute } from "@/data/routes";

const cardStepRem = 21.25;

interface Props {
  routes?: StoryRoute[];
}

export function FeaturedRoutesCarousel({ routes = [] }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = routes.length;
  const maxIndex = Math.max(total - 1, 0);

  // Debug logging
  console.log(`[Carousel] Rendering ${total} routes. Active: ${activeIndex}`);

  function showNextRoute() {
    setActiveIndex((current) => (current + 1) % total);
  }

  function showPreviousRoute() {
    setActiveIndex((current) => (current - 1 + total) % total);
  }

  if (total === 0) return null;

  return (
    <section className="overflow-hidden bg-[var(--night)] py-16 text-white lg:py-24">
      <div className="site-container grid gap-10 lg:grid-cols-[0.38fr_0.62fr] lg:items-center">
        {/* Text Side */}
        <div className="relative overflow-hidden">
          <div className="absolute -left-28 top-20 hidden h-80 w-80 rounded-[45%] border border-white/8 lg:block" />
          <div
            className="relative z-10 flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {routes.map((route) => (
              <div key={route.slug} className="w-full shrink-0 pr-8">
                <p className="text-label text-white/54">{route.culture}</p>
                <h2 className="mt-5 max-w-[15ch] font-[family:var(--font-display)] text-4xl leading-[1.08] text-white md:text-5xl">
                  {route.title}
                </h2>
                <p className="mt-6 max-w-sm border-l border-white/16 pl-5 text-base leading-8 text-white/72">
                  {route.summary}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Image Side */}
        <div className="relative">
          <div className="flex justify-end overflow-hidden pr-10 sm:pr-16">
            <div
              className="flex flex-row-reverse gap-5 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ 
                transform: `translateX(calc(${activeIndex} * (var(--card-width, 17.5rem) + 1.25rem)))` 
              }}
            >
              <style jsx>{`
                @media (min-width: 640px) {
                  div { --card-width: 20rem; }
                }
              `}</style>
              {routes.map((route) => (
                <Link
                  key={route.slug}
                  href={`/routes/${route.slug}`}
                  className={`group relative h-[32rem] w-[20rem] shrink-0 transition-all duration-700 ${
                    activeIndex === routes.indexOf(route) ? "scale-100 opacity-100" : "scale-90 opacity-40 grayscale"
                  }`}
                >
                  <div className="relative h-full w-full scrapbook-shadow border-[0.85rem] border-white overflow-hidden bg-white">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition duration-1000 group-hover:scale-110"
                      style={{ backgroundImage: `url(${route.image})` }}
                    />
                    <div className="absolute inset-0 bg-black/5" />

                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-[var(--river-deep)]">
                      <div className="relative z-10 space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                          {route.culture} — {route.duration}
                        </p>
                        <h3 className="font-[family:var(--font-display)] text-3xl leading-tight">
                          {route.title}
                        </h3>
                        <div className="max-h-0 overflow-hidden opacity-0 group-hover:max-h-32 group-hover:opacity-100 transition-all duration-500">
                          <p className="text-sm leading-relaxed handwritten line-clamp-2">
                            {route.summary}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tape decoration */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-10 bg-white/20 backdrop-blur-sm -rotate-2 z-20" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {total > 1 && (
            <div className="flex gap-4 mt-8 lg:mt-0">
              {activeIndex > 0 && (
                <button
                  type="button"
                  aria-label="Show previous route"
                  className="btn-icon-dark absolute left-3 top-1/2 z-20 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    showPreviousRoute();
                  }}
                >
                  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M16 5L9 12L16 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}

              {activeIndex < maxIndex && (
                <button
                  type="button"
                  aria-label="Show next route"
                  className="btn-icon-dark absolute right-3 top-1/2 z-20 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    showNextRoute();
                  }}
                >
                  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5L15 12L8 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
