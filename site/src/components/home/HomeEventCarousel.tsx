"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import type { EventData } from "@/lib/api-data";
import { Reveal } from "@/components/ui/Reveal";

type Props = {
  events?: EventData[];
};

export function HomeEventCarousel({ events = [] }: Props) {
  const { locale } = useLocale();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!events.length) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [events.length]);

  if (!events.length) return null;

  const currentEvent = events[currentIndex];

  return (
    <div className="relative h-[60svh] max-h-[500px] w-full overflow-hidden bg-[var(--night)] lg:h-[650px]">
      {/* Background Image with Ken Burns effect */}
      {events.map((event, idx) => (
        <div
          key={event.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex
              ? "opacity-60 scale-100"
              : "opacity-0 scale-110"
          }`}
          style={{
            backgroundImage: `url(${event.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "opacity 1s ease-in-out, transform 6s linear",
          }}
        />
      ))}

      {/* Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(17,25,35,0.4),rgba(17,25,35,0.8)_80%)]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-[linear-gradient(0deg,var(--background),transparent)]" />

      {/* Content */}
      <div className="site-container relative flex h-full flex-col justify-end pb-24 lg:pb-32">
        <Reveal key={currentEvent.id} duration={800}>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="bg-[var(--cinnabar)] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                {locale === "zh" ? "近期推荐" : "Featured Event"}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                {currentEvent.date} — {currentEvent.city}
              </span>
            </div>

            <h2 className="mt-6 font-[family:var(--font-display)] text-4xl leading-[1.1] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {currentEvent.title}
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
              {currentEvent.summary}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={`/routes?event=${currentEvent.id}`}
                className="btn-primary kinetic-link px-8 py-4 text-xs"
              >
                {locale === "zh" ? "探索关联路线" : "Explore Related Routes"}
              </Link>
              <Link
                href={`/culture/${currentEvent.citySlug}`}
                className="btn-outline px-8 py-4 text-xs"
              >
                {locale === "zh" ? "查看城市故事" : "View City Story"}
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Indicators */}
        <div className="mt-12 flex gap-3">
          {events.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1 transition-all duration-500 ${
                idx === currentIndex
                  ? "w-12 bg-[var(--gold)]"
                  : "w-6 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
