"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";

interface InterpreterFlipCardProps {
  role: string;
  language: string;
  focus: string;
  helps: string[];
  index: number;
}

export function InterpreterFlipCard({ role, language, focus, helps, index }: InterpreterFlipCardProps) {
  const { t } = useLocale();
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="group perspective-[1200px] h-56 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
      onKeyDown={(e) => e.key === "Enter" && setFlipped(!flipped)}
      tabIndex={0}
      role="button"
      aria-label={flipped ? `Show ${role} front` : `Show ${role} details`}
    >
      <div
        className="relative h-full w-full transition-transform duration-700"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 flex flex-col justify-between border border-white/10 bg-white/4 p-5 backdrop-blur-sm"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div>
            <span className="border border-white/14 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
              {t("interpreting.card.profilePrefix")} 0{index + 1}
            </span>
            <h3 className="mt-5 font-[family:var(--font-display)] text-2xl text-white">{role}</h3>
            <p className="mt-3 text-sm leading-6 text-white/50">{language}</p>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-white/30">
            {t("interpreting.card.tapToFlip")} ↻
          </p>
        </div>

        {/* ── BACK ── */}
        <div
          className="absolute inset-0 flex flex-col border border-[var(--gold)]/30 bg-white/6 p-5 backdrop-blur-sm"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <p className="text-sm leading-7 text-white/78">{focus}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            {helps.map((item) => (
              <span
                key={item}
                className="border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/64"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
