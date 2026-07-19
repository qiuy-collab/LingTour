"use client";

import type { FieldBrief } from "@/lib/api-data";

export function BriefCard({ brief, onSelect }: { brief: FieldBrief; onSelect: (brief: FieldBrief) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(brief)}
      className="group w-full rounded-[var(--radius-lg)] border border-[var(--gold)]/26 bg-[var(--gold)]/[0.07] p-6 text-left shadow-[0_16px_52px_rgba(17,25,35,0.06)] transition duration-500 hover:-translate-y-1 hover:border-[var(--gold)]/55 hover:bg-[var(--gold)]/[0.1] sm:p-7"
    >
      <div className="flex items-start justify-between gap-5 border-b border-[var(--gold)]/18 pb-5">
        <div>
          <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Active brief</p>
          <p className="mt-2 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)]">{brief.channel}</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--gold)]/28 text-lg text-[var(--gold)] transition group-hover:rotate-90 group-hover:bg-[var(--gold)] group-hover:text-[var(--night)]" aria-hidden>+</span>
      </div>
      <p className="mt-6 font-[family:var(--font-display)] text-3xl leading-[0.98] text-[var(--river-deep)] transition-colors group-hover:text-[var(--cinnabar)]">{brief.title}</p>
      <p className="mt-4 line-clamp-4 text-sm leading-7 text-[var(--muted)]">{brief.prompt}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {brief.location ? <span className="rounded-full border border-[var(--line)] bg-white/52 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--muted)]">@{brief.location}</span> : null}
        {brief.route ? <span className="rounded-full border border-[var(--line)] bg-white/52 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--muted)]">#{brief.route}</span> : null}
      </div>
    </button>
  );
}
