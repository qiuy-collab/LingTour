"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";

type Props = {
  cityName?: string;
};

export function CuratingPlaceholder({ cityName }: Props) {
  const { locale } = useLocale();
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cinnabar)]">
        {locale === "zh" ? "\u6863\u6848\u72b6\u6001" : "Record Status"}
      </p>
      <h2 className="mt-5 max-w-md font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)] md:text-4xl">
        {cityName || (locale === "zh" ? "\u57ce\u5e02\u6863\u6848" : "City Record")}
      </h2>
      <span className="mt-6 border border-[var(--line)] bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
        {locale === "zh" ? "\u672a\u53d1\u5e03" : "Not Published"}
      </span>
      <Link href="/culture" className="btn-primary mt-8 px-6 py-4 text-xs">
        {locale === "zh" ? "\u67e5\u770b\u5df2\u53d1\u5e03\u57ce\u5e02" : "Published Cities"}
      </Link>
    </div>
  );
}
