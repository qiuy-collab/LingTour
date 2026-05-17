"use client";

import { Reveal } from "@/components/ui/Reveal";
import { ImageParallax } from "@/components/culture/ImageParallax";

type Props = {
  title: string;
  body: string;
  image: string;
  align: "left" | "right";
  index: number;
  stat?: string;
  sectionId: string;
};

export function ArticleSplitScreen({ title, body, image, align, index, stat, sectionId }: Props) {
  const isLeft = align === "left";

  return (
    <section
      id={sectionId}
      className={`relative overflow-hidden py-16 lg:py-28 ${
        index % 2 === 0 ? "bg-[var(--background)]" : "bg-[var(--paper-deep)]"
      }`}
    >
      <div className="site-container">
        <div
          className={`grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20 ${
            isLeft ? "" : "lg:grid-flow-dense"
          }`}
        >
          {/* Text side */}
          <div className={isLeft ? "" : "lg:col-start-2"}>
            <Reveal>
              <div className="max-w-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cinnabar)]">
                  Chapter {index + 1}
                </p>
                <h2 className="mt-4 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] md:text-4xl">
                  {title}
                </h2>
                <div className="mt-6 h-px w-16 bg-[var(--gold)]/30" />
                <p className="mt-6 text-base leading-relaxed text-[var(--muted)]">
                  {body}
                </p>

                {stat && (
                  <div className="mt-10 border-l-2 border-[var(--gold)]/40 pl-6 py-2">
                    <span className="text-sm font-medium text-[var(--muted)]">
                      {stat}
                    </span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>

          {/* Image side */}
          <div className={isLeft ? "lg:order-first" : ("" as unknown as undefined)}>
            <Reveal delay={150}>
              <div className="relative overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[0_8px_32px_rgba(17,25,35,0.05)]">
                <ImageParallax className="aspect-[4/5]" speed={0.1}>
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                </ImageParallax>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
