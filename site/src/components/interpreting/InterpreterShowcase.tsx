"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

export type InterpreterProfile = {
  id: string;
  level?: string;
  levelZh?: string;
  name: string;
  specialty: string;
  languages: string;
  serviceCount: number;
  image: string;
  needsPrefill: string;
  rateLabel?: string;
  bestFor?: string;
};

type Props = {
  profiles: InterpreterProfile[];
  onSelectGuide: (needsText: string) => void;
  locale?: "en" | "zh";
};

export function InterpreterShowcase({ profiles, onSelectGuide, locale = "en" }: Props) {
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const handleSelect = (profile: InterpreterProfile) => {
    setSelectedProfileId(profile.id);
    onSelectGuide(profile.needsPrefill);
    const el = document.getElementById("interpreting-booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="site-container py-16 lg:py-24">
      <div className="mb-8 opacity-60">
        <Reveal>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
            {locale === "zh" ? "\u53e3\u8bd1\u5458\u7b49\u7ea7" : "Interpreter Levels"}
          </p>
          <h2 className="mt-3 max-w-[13ch] font-[family:var(--font-display)] text-3xl leading-[1.04] tracking-[-0.02em] text-[var(--river-deep)] md:max-w-none md:whitespace-nowrap">
            {locale === "zh" ? "\u521d\u7ea7\u3001\u4e2d\u7ea7\u3001\u9ad8\u7ea7\u3002" : "Three levels, clearly distinct."}
          </h2>
        </Reveal>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {profiles.map((profile, index) => {
          const isSelected = selectedProfileId === profile.id;

          return (
            <Reveal key={profile.id} delay={index * 100}>
              <article
                className={[
                  "group relative overflow-hidden bg-[var(--paper)] bg-grain transition-all duration-500 scrapbook-shadow border border-[var(--line)]",
                  index % 2 === 0 ? "rotate-1" : "-rotate-1",
                  isSelected
                    ? "border-[var(--cinnabar)] ring-1 ring-[var(--cinnabar)]/20"
                    : "hover:-translate-y-2 hover:rotate-0",
                ].join(" ")}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)] border-b border-[var(--line)]">
                  <div
                    className={[
                      "absolute inset-0 bg-cover bg-center transition-all duration-1000",
                      isSelected
                        ? "scale-105 grayscale-0"
                        : "grayscale group-hover:scale-110 group-hover:grayscale-0",
                    ].join(" ")}
                    style={{ backgroundImage: `url(${profile.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--river-deep)]/80 via-transparent to-transparent opacity-60" />

                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-bold uppercase tracking-[0.2em] text-white">
                      {locale === "zh" ? profile.levelZh ?? profile.level : profile.level ?? profile.levelZh}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 z-10">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--gold)] mb-1 handwritten">
                      {profile.specialty}
                    </p>
                    <h3 className="font-[family:var(--font-display)] text-3xl text-white leading-tight">
                      {profile.name}
                    </h3>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex-1">
                      <p className="text-xs leading-relaxed text-[var(--muted)] italic mb-2">
                        {profile.languages}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-[var(--cinnabar)] animate-pulse" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--cinnabar)]">
                          {profile.serviceCount}+ Dispatches
                        </p>
                      </div>
                    </div>
                    {profile.rateLabel ? (
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-1">Rate</p>
                        <p className="text-sm font-bold text-[var(--river-deep)]">{profile.rateLabel.split(' ')[0]}</p>
                      </div>
                    ) : null}
                  </div>

                  {profile.bestFor ? (
                    <div className="mb-8 p-4 bg-[var(--paper-deep)]/40 border-l border-[var(--gold)]/30 italic">
                      <p className="text-[13px] leading-relaxed text-[var(--muted)] handwritten">
                        &ldquo;{profile.bestFor}&rdquo;
                      </p>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleSelect(profile)}
                    className={[
                      "btn-primary w-full py-4 text-[10px] flex items-center justify-between group/btn",
                      isSelected ? "bg-[var(--cinnabar)]" : ""
                    ].join(" ")}
                  >
                    <span>{locale === "zh" ? "\u9009\u62e9\u8be5\u7b49\u7ea7" : "Assign to Brief"}</span>
                    <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
