"use client";

import Link from "next/link";

type Props = {
  cityName?: string;
};

export function CuratingPlaceholder({ cityName }: Props) {
  
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
        {"Record Status"}
      </p>
      <h2 className="mt-5 max-w-md font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] md:text-4xl">
        {cityName || "City Record"}
      </h2>
      <span className="mt-6 border border-[var(--line)] bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
        {"Not Published"}
      </span>
      <Link href="/culture" className="btn-primary mt-8 px-6 py-4 text-xs">
        {"Published Cities"}
      </Link>
    </div>
  );
}
