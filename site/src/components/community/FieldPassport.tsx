"use client";

import { useState, useEffect, useRef } from "react";
import { Reveal } from "@/components/ui/Reveal";

function usePrevious<T>(value: T) {
  const ref = useRef<T>(undefined);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

type FieldPassportProps = {
  stampCount: number;
};

export function FieldPassport({ stampCount }: FieldPassportProps) {
  const [isStamping, setIsStamping] = useState(false);
  const prevCount = usePrevious(stampCount);

  useEffect(() => {
    if (stampCount > (prevCount ?? 0)) {
      setIsStamping(true);
      const timer = setTimeout(() => setIsStamping(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [stampCount, prevCount]);

  const stamps = Array.from({ length: Math.max(stampCount, 3) }, (_, i) => i < stampCount);

  return (
    <Reveal delay={200}>
      <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--paper)] p-6 shadow-xl">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[var(--gold)]/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cinnabar)]">Field Intelligence</p>
            <h3 className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">Explorer Passport</h3>
          </div>
          <div className={`h-10 w-10 rounded-full border border-[var(--gold)] flex items-center justify-center font-bold transition-all duration-500 ${isStamping ? "bg-[var(--gold)] text-white scale-125 rotate-12" : "text-[var(--gold)]"}`}>
            {stampCount}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 relative">
          {isStamping && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-[var(--gold)] text-white px-4 py-2 rounded-full font-bold text-xs animate-bounce shadow-2xl">
                NEW STAMP! +1
              </div>
            </div>
          )}
          {stamps.map((earned, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center transition-all duration-500 ${
                earned
                ? "border-[var(--gold)] bg-white shadow-inner rotate-[-4deg] scale-105"
                : "border-[var(--line)] bg-black/5 opacity-40"
              }`}
            >
              {earned ? (
                <div className="text-[var(--gold)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
              ) : (
                <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">{i + 1}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-[var(--night)] p-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">Current Rank</p>
          <p className="mt-1 font-[family:var(--font-display)] text-xl">
            {stampCount >= 10 ? "Route Master" : stampCount >= 5 ? "Pathfinder" : "Fresh Recruit"}
          </p>
          <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--gold)] transition-all duration-1000"
              style={{ width: `${Math.min((stampCount % 5) * 20, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-white/40 text-right uppercase tracking-wider">
            {5 - (stampCount % 5)} stamps to next rank
          </p>
        </div>
      </div>
    </Reveal>
  );
}
