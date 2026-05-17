"use client";

import { Reveal } from "@/components/ui/Reveal";
import { ImageParallax } from "@/components/culture/ImageParallax";
import { marked } from "marked";

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
  const renderedBody = marked.parse(body, { breaks: true }) as string;

  return (
    <section
      id={sectionId}
      className={`relative overflow-hidden py-16 lg:py-28 bg-grain ${
        index % 2 === 0 ? "bg-[var(--background)]" : "bg-[var(--paper-deep)]"
      }`}
    >
      <div className="site-container">
        <div
          className={`grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-24 ${
            isLeft ? "" : "lg:grid-flow-dense"
          }`}
        >
          {/* Text side */}
          <div className={isLeft ? "" : "lg:col-start-2"}>
            <Reveal>
              <div className="max-w-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--cinnabar)] handwritten">
                  Chapter {index + 1}
                </p>
                <h2 className="mt-4 font-[family:var(--font-display)] text-4xl leading-tight text-[var(--river-deep)] md:text-5xl">
                  {title}
                </h2>
                <div className="mt-8 h-px w-20 bg-[var(--gold)]/40" />
                <div
                  className="mt-8 text-lg leading-relaxed text-[var(--muted)] [&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-[family:var(--font-display)] [&_h1]:text-[var(--river-deep)] [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-[family:var(--font-display)] [&_h2]:text-[var(--river-deep)] [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[var(--river-deep)] [&_li]:ml-5 [&_li]:list-disc [&_li]:py-1 [&_p]:mb-5 [&_p:last-child]:mb-0 [&_strong]:text-[var(--ink)]"
                  dangerouslySetInnerHTML={{ __html: renderedBody }}
                />

                {stat && (
                  <div className="mt-12 border-l-2 border-[var(--gold)]/40 pl-6 py-2">
                    <span className="text-sm font-medium text-[var(--muted)] handwritten">
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
              <div className={`relative overflow-hidden border-8 border-white bg-white scrapbook-shadow transition-transform duration-700 ${isLeft ? '-rotate-1 hover:rotate-0' : 'rotate-1 hover:rotate-0'}`}>
                <ImageParallax className="aspect-[4/5]" speed={0.1}>
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                </ImageParallax>
                {/* Decorative tape */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-white/30 backdrop-blur-[2px] border border-black/5 ${isLeft ? 'rotate-2' : '-rotate-2'}`} />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
