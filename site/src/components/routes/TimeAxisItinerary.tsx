"use client";

import { motion } from "framer-motion";

type Stop = {
  time: string;
  stop: string;
  plan?: string;
  story: string;
  details: string[];
  culturalStory: string;
  image?: string;
  meal?: string;
  hotel?: string;
  transit?: string;
  placeDetail?: string;
};

type Props = {
  stops: Stop[];
  routeStory: string;
  routeTitle: string;
};

function StopNode({ stop, index, total }: { stop: Stop; index: number; total: number }) {
  const isEven = index % 2 === 0;

  return (
    <article id={`stop-${index}`} className="relative w-full py-12 lg:py-24">
      {/* Center timeline line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--line)] via-[var(--line)] to-[var(--line)]/30 -translate-x-1/2 hidden lg:block" />

      {/* Desktop Layout - Alternating Left/Right */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-16 relative">
        {/* Timeline Node */}
        <div className="absolute left-1/2 top-24 w-4 h-4 rounded-full border-[3px] border-[var(--cinnabar)] bg-[var(--background)] -translate-x-1/2 z-10 shadow-[0_0_15px_var(--cinnabar)]" />

        {/* Left Side Content */}
        <div className={`flex flex-col ${isEven ? 'items-end text-right' : 'items-start text-left col-start-2'}`}>
          <div className={`flex items-baseline gap-4 ${isEven ? 'flex-row-reverse' : ''}`}>
             <p className="font-mono text-5xl font-black tracking-tighter text-[var(--cinnabar)] xl:text-6xl">
              {stop.time}
            </p>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muted)] opacity-50">
              Entry_{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mt-2 font-[family:var(--font-display)] text-4xl leading-[1.1] text-[var(--river-deep)] xl:text-5xl">
            {stop.stop}
          </h3>

          <div className="mt-8 relative z-10 max-w-lg">
             <p className="text-[16px] leading-[1.8] text-[var(--river-deep)]/90 xl:text-[18px]">
              {stop.story}
            </p>
          </div>

          {stop.details?.length ? (
            <div className={`mt-8 grid grid-cols-1 gap-3 max-w-md ${isEven ? 'text-right' : 'text-left'}`}>
              {stop.details.map((detail, detailIndex) => (
                <div
                  key={`detail-${detailIndex}`}
                  className={`flex items-start gap-3 text-[13px] text-[var(--muted)] ${isEven ? 'flex-row-reverse' : ''}`}
                >
                  <div className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full border border-[var(--gold)]" />
                  <span className="handwritten">{detail}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Right Side Content (or Left if odd) */}
        <div className={`flex flex-col gap-8 ${isEven ? 'items-start col-start-2' : 'items-end row-start-1 text-right'}`}>
          {stop.image ? (
            <figure className={`relative w-full max-w-md ${isEven ? 'rotate-1' : '-rotate-1'} mt-20`}>
              <div className="overflow-hidden border-[10px] border-white bg-white scrapbook-shadow">
                <img
                  src={stop.image}
                  alt={stop.stop}
                  className="w-full aspect-[4/3] object-cover filter saturate-[0.8] contrast-125 sepia-[0.1]"
                  loading="lazy"
                />
              </div>
            </figure>
          ) : <div className="h-20" />}

          {stop.culturalStory ? (
             <div
               className={`mt-4 max-w-md border-t border-[var(--gold)]/30 pt-6 ${
                 isEven ? "text-left" : "text-right"
               }`}
             >
               <p className="mb-2 font-mono text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--gold)]">
                 Field Note
               </p>
               <p className="font-[family:var(--font-display)] text-xl italic leading-[1.6] text-[var(--river-deep)]/80">
                 &ldquo;{stop.culturalStory}&rdquo;
               </p>
             </div>
          ) : null}

          {/* Itinerary details */}
          {(stop.meal || stop.transit || stop.hotel) && (
             <div className={`flex flex-wrap gap-3 mt-4 ${isEven ? 'justify-start' : 'justify-end'} max-w-md`}>
                {[
                  { icon: "🍜", label: "Eat", val: stop.meal },
                  { icon: "🚐", label: "Move", val: stop.transit },
                  { icon: "🛏", label: "Stay", val: stop.hotel }
                ].filter(i => i.val).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-[var(--paper)] px-3 py-1.5 border border-[var(--line)]/50 scrapbook-shadow">
                     <span className="text-xs">{item.icon}</span>
                     <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--river-deep)]">{item.val}</span>
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Mobile Layout - Single Column */}
      <div className="flex flex-col lg:hidden relative pl-8 border-l border-[var(--line)]/50 ml-4">
        <div className="absolute left-[-5px] top-6 w-2.5 h-2.5 rounded-full bg-[var(--cinnabar)] shadow-[0_0_8px_var(--cinnabar)]" />

        <div className="flex items-baseline gap-3">
           <p className="font-mono text-3xl font-black tracking-tighter text-[var(--cinnabar)]">
            {stop.time}
          </p>
        </div>

        <h3 className="mt-2 font-[family:var(--font-display)] text-3xl leading-[1.1] text-[var(--river-deep)]">
          {stop.stop}
        </h3>

        <div className="mt-6">
           <p className="text-[15px] leading-[1.7] text-[var(--river-deep)]/90">
            {stop.story}
          </p>
        </div>

        {stop.image && (
          <figure className="relative w-full mt-8 -rotate-1">
            <div className="overflow-hidden border-[8px] border-white bg-white scrapbook-shadow">
              <img
                src={stop.image}
                alt={stop.stop}
                className="w-full aspect-square object-cover filter saturate-[0.8] sepia-[0.1]"
                loading="lazy"
              />
            </div>
          </figure>
        )}

        {stop.culturalStory && (
           <div className="mt-8 border-l-2 border-[var(--gold)]/50 pl-4 py-2">
             <p className="font-[family:var(--font-display)] text-lg italic leading-[1.5] text-[var(--river-deep)]/80">
               &ldquo;{stop.culturalStory}&rdquo;
             </p>
           </div>
        )}

        {stop.details?.length ? (
          <div className="mt-6 flex flex-col gap-2">
            {stop.details.map((detail, detailIndex) => (
              <div key={`detail-mobile-${detailIndex}`} className="flex items-start gap-2 text-[13px] text-[var(--muted)]">
                <div className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[var(--gold)]" />
                <span className="handwritten">{detail}</span>
              </div>
            ))}
          </div>
        ) : null}

        {(stop.meal || stop.transit || stop.hotel) && (
           <div className="flex flex-wrap gap-2 mt-6">
              {[
                { icon: "🍜", val: stop.meal },
                { icon: "🚐", val: stop.transit },
                { icon: "🛏", val: stop.hotel }
              ].filter(i => i.val).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-white/50 px-2 py-1 border border-[var(--line)]/30 text-[11px]">
                   <span>{item.icon}</span>
                   <span className="font-mono text-[10px] uppercase text-[var(--river-deep)]">{item.val}</span>
                </div>
              ))}
           </div>
        )}
      </div>
    </article>
  );
}

export function TimeAxisItinerary({ stops, routeStory, routeTitle }: Props) {
  if (stops.length === 0) return null;

  return (
    <section id="itinerary" className="relative overflow-hidden bg-[var(--background)] bg-grain pb-20 pt-16 lg:pb-32 lg:pt-24">
      <div className="site-container relative z-10">
        <header className="mb-20 max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4">
            <span className="h-px w-8 bg-[var(--cinnabar)]" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">
              Daily Log
            </p>
            <span className="h-px w-8 bg-[var(--cinnabar)]" />
          </div>
          <h2 className="mt-6 font-[family:var(--font-display)] text-5xl leading-[1] text-[var(--river-deep)] md:text-6xl">
            The <span className="italic text-[var(--gold)]">Story</span> of Today.
          </h2>
          <div className="mt-10 mx-auto max-w-2xl bg-[var(--paper-deep)] p-8 scrapbook-shadow rotate-1">
            <p className="text-[17px] leading-[1.8] text-[var(--muted)] handwritten lg:text-[19px]">
              {routeStory}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-6xl relative">
          {/* Top and Bottom faded line connections for desktop */}
          <div className="absolute left-1/2 top-0 h-12 w-px bg-gradient-to-t from-[var(--line)] to-transparent -translate-x-1/2 hidden lg:block" />
          <div className="absolute left-1/2 bottom-0 h-12 w-px bg-gradient-to-b from-[var(--line)] to-transparent -translate-x-1/2 hidden lg:block" />

          {stops.map((stop, idx) => (
            <StopNode key={`stop-${idx}`} stop={stop} index={idx} total={stops.length} />
          ))}

          <div className="mt-16 flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--cinnabar)]/30 bg-[var(--paper-deep)]">
               <div className="h-2 w-2 rounded-full bg-[var(--cinnabar)]" />
            </div>
            <p className="mt-4 text-center font-mono text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--cinnabar)]">
              End of Route
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
