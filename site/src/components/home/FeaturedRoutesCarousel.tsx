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
                  className="group relative h-[28rem] w-[17.5rem] shrink-0 overflow-hidden bg-black text-white sm:h-[34rem] sm:w-[20rem]"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-82 transition duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${route.image})` }}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.34)_45%,rgba(0,0,0,0.88))]" />
                  <div className="relative z-10 flex h-full flex-col justify-between p-5 sm:p-6">
                    <p className="self-end text-sm font-bold uppercase">{route.duration}</p>
                    <div>
                      <p className="text-sm font-bold uppercase text-white/80">{route.culture}</p>
                      <h3 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight sm:text-3xl">
                        {route.title}
                      </h3>
                      <div className="mt-4 max-h-64 translate-y-0 overflow-hidden opacity-100 transition-all duration-500 md:max-h-0 md:translate-y-8 md:opacity-0 md:group-hover:max-h-64 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                        <p className="text-sm leading-7 text-white/82">{route.summary}</p>
                        <span className="mt-5 inline-block border border-white/70 px-5 py-3 text-sm font-semibold">
                          Explore trip
                        </span>
                      </div>
                    </div>
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
                  className="absolute left-3 top-1/2 z-20 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/28 bg-white/12 text-white backdrop-blur transition hover:bg-white hover:text-[var(--night)]"
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
                  className="absolute right-3 top-1/2 z-20 inline-flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/28 bg-white/12 text-white backdrop-blur transition hover:bg-white hover:text-[var(--night)]"
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
