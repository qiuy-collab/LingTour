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

      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        {profiles.map((profile, index) => {
          const isSelected = selectedProfileId === profile.id;

          return (
            <Reveal key={profile.id} delay={index * 100}>
              <article
                className={[
                  "group relative overflow-hidden rounded-[2rem] border bg-white transition-all duration-500",
                  isSelected
                    ? "border-[var(--cinnabar)] shadow-[0_28px_80px_rgba(140,58,44,0.18)]"
                    : "border-[var(--line)] shadow-[0_18px_55px_rgba(17,25,35,0.08)] hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(17,25,35,0.13)]",
                ].join(" ")}
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--paper-deep)]">
                  <div
                    className={[
                      "absolute inset-0 bg-cover bg-center transition-all duration-700",
                      isSelected
                        ? "scale-100 grayscale-0 saturate-100"
                        : "grayscale saturate-[0.7] group-hover:scale-105 group-hover:grayscale-0 group-hover:saturate-100",
                    ].join(" ")}
                    style={{ backgroundImage: `url(${profile.image})` }}
                  />
                  <div
                    className={[
                      "absolute inset-0 transition-all duration-500",
                      isSelected
                        ? "bg-[linear-gradient(0deg,rgba(17,25,35,0.72),rgba(17,25,35,0.08)_48%,transparent)]"
                        : "bg-[linear-gradient(0deg,rgba(17,25,35,0.82),rgba(17,25,35,0.2)_48%,transparent)]",
                    ].join(" ")}
                  />
                  <div
                    className={[
                      "absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur-md transition-all duration-500",
                      isSelected
                        ? "border border-[var(--gold)]/40 bg-[var(--gold)]/18 text-[var(--gold)]"
                        : "border border-white/20 bg-black/35 text-white/72",
                    ].join(" ")}
                  >
                    {locale === "zh" ? profile.levelZh ?? profile.level : profile.level ?? profile.levelZh}
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <p
                      className={[
                        "text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-500",
                        isSelected ? "text-[var(--gold)]" : "text-white/52",
                      ].join(" ")}
                    >
                      {profile.specialty}
                    </p>
                    <h3 className="mt-2 font-[family:var(--font-display)] text-[1.75rem] leading-[1.08] tracking-[-0.02em]">{profile.name}</h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="max-w-[22ch] text-[13px] leading-6 text-[var(--muted)]">{profile.languages}</p>
                      <p className="mt-2 text-[11px] text-[var(--cinnabar)]">
                        {profile.serviceCount}+ {locale === "zh" ? "\u6b21\u670d\u52a1" : "bookings completed"}
                      </p>
                    </div>
                    {profile.rateLabel ? (
                      <span className="rounded-full bg-[var(--gold)]/12 px-3 py-1 text-[11px] font-bold text-[var(--cinnabar)]">
                        {profile.rateLabel}
                      </span>
                    ) : null}
                  </div>

                  {profile.bestFor ? (
                    <p className="mt-4 rounded-2xl bg-[var(--paper-deep)] px-4 py-3 text-[13px] leading-6 text-[var(--muted)]">
                      {profile.bestFor}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => handleSelect(profile)}
                    className={[
                      "mt-5 flex w-full items-center justify-between rounded-full px-5 py-3 text-[11px] font-bold uppercase tracking-[0.14em] transition",
                      isSelected
                        ? "border border-[var(--cinnabar)] bg-[var(--cinnabar)] text-white"
                        : "border border-[var(--line)] text-[var(--cinnabar)] hover:border-[var(--cinnabar)] hover:bg-[var(--cinnabar)] hover:text-white",
                    ].join(" ")}
                  >
                    <span>{locale === "zh" ? "\u9009\u62e9\u8be5\u7b49\u7ea7" : "Use this level"}</span>
                    <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
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
