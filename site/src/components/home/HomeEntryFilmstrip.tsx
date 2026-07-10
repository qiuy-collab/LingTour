"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HomeEntryCard } from "@/types/content";
import { useLocale } from "@/lib/locale-context";
import { placeholderFor } from "@/lib/placeholders";

type HomeEntryFilmstripProps = {
  cards: HomeEntryCard[];
};

export function HomeEntryFilmstrip({ cards }: HomeEntryFilmstripProps) {
  const { t } = useLocale();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const updateActiveCard = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const cardsInTrack = Array.from(track.children) as HTMLElement[];
        if (!cardsInTrack.length) return;
        const nearest = cardsInTrack.reduce(
          (best, card, index) => {
            const distance = Math.abs(card.offsetLeft - track.scrollLeft);
            return distance < best.distance ? { index, distance } : best;
          },
          { index: 0, distance: Number.POSITIVE_INFINITY },
        );
        setActiveIndex(nearest.index);
      });
    };

    updateActiveCard();
    track.addEventListener("scroll", updateActiveCard, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", updateActiveCard);
    };
  }, [cards.length]);

  function moveTo(index: number) {
    const track = trackRef.current;
    const card = track?.children.item(index) as HTMLElement | null;
    if (!track || !card) return;
    track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
  }

  return (
    <div className="group/strip relative">
      <div
        ref={trackRef}
        className="home-entry-track flex snap-x snap-mandatory gap-5 overflow-x-auto pb-7 pr-10 sm:gap-7 sm:pr-16"
        aria-label={t("home.entryCards.galleryLabel")}
      >
        {cards.map((card, index) => (
          <Link
            key={card.id}
            href={card.href}
            className="group/card block w-[min(78vw,17.5rem)] shrink-0 snap-start border border-[var(--line)] bg-white/76 transition duration-500 hover:-translate-y-1 hover:border-[var(--gold)] sm:w-80"
          >
            <div className="relative aspect-[16/10] overflow-hidden border-[0.45rem] border-white bg-[var(--paper)]">
              <img
                src={card.image || placeholderFor("hero")}
                alt={card.title}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
              />
              <span className="absolute right-3 top-3 bg-[var(--paper)]/92 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--river-deep)]">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="min-h-48 p-6">
              <h3 className="font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)] transition-colors group-hover/card:text-[var(--cinnabar)]">
                {card.title}
              </h3>
              <p className="handwritten mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
                {card.body}
              </p>
              <div className="mt-6 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                <span>{t("common.btn.explore")}</span>
                <span className="h-px w-8 bg-[var(--gold)] transition-all group-hover/card:w-12" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {cards.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[var(--paper-deep)] to-transparent sm:w-20" />
          <div className="mt-1 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2" aria-label={t("home.entryCards.progressLabel")}>
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => moveTo(index)}
                  className={`h-2.5 w-2.5 rounded-full border transition-colors ${
                    activeIndex === index
                      ? "border-[var(--gold)] bg-[var(--gold)]"
                      : "border-[var(--line)] bg-transparent hover:border-[var(--river-deep)]"
                  }`}
                  aria-label={t("home.entryCards.goTo").replace("{number}", String(index + 1))}
                  aria-current={activeIndex === index ? "true" : undefined}
                />
              ))}
            </div>
            <div className="hidden gap-2 opacity-0 transition-opacity group-hover/strip:opacity-100 sm:flex">
              <button
                type="button"
                onClick={() => moveTo(Math.max(0, activeIndex - 1))}
                disabled={activeIndex === 0}
                className="grid h-11 w-11 place-items-center border border-[var(--line)] bg-white/80 text-[var(--river-deep)] transition hover:border-[var(--river-deep)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={t("home.entryCards.previous")}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => moveTo(Math.min(cards.length - 1, activeIndex + 1))}
                disabled={activeIndex === cards.length - 1}
                className="grid h-11 w-11 place-items-center border border-[var(--line)] bg-white/80 text-[var(--river-deep)] transition hover:border-[var(--river-deep)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label={t("home.entryCards.next")}
              >
                →
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
