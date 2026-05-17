"use client";

import { Reveal } from "@/components/ui/Reveal";

type Props = {
  image: string;
  quote?: string;
  attribution: string;
};

export function BreathingPoint({ image, quote, attribution }: Props) {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28">
      {/* Background image — faded */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed opacity-25 grayscale"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-[var(--paper-deep)]/80" />

      {/* Content */}
      <div className="site-container relative z-10 text-center">
        <Reveal>
          {quote && (
            <blockquote className="mx-auto max-w-2xl font-[family:var(--font-display)] text-2xl italic leading-relaxed text-[var(--river-deep)] md:text-3xl">
              &ldquo;{quote}&rdquo;
            </blockquote>
          )}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-8 bg-[var(--gold)]/40" />
            <span className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              {attribution}
            </span>
            <div className="h-px w-8 bg-[var(--gold)]/40" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
