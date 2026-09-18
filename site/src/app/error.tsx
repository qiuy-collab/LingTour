"use client";

import Link from "next/link";
import { useEffect } from "react";
import { translate } from "@/translations";

/**
 * Route-segment error boundary (App Router convention: app/error.tsx).
 *
 * Catches runtime errors thrown by any page below the root layout. It renders
 * INSIDE `layout.tsx`, so it must not declare a `<main>` landmark — the layout
 * already provides one (see AGENT/plan P0-6).
 *
 * Retry uses this Next.js version's `unstable_retry` prop, not the older
 * `reset` name.
 */
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = (key: string) => translate(key);

  return (
    <div className="bg-[var(--paper-deep)] bg-grain min-h-screen text-[var(--river-deep)]">
      <section className="site-container flex min-h-[80vh] flex-col items-center justify-center py-32 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--cinnabar)]">
          {t("common.error.badge")}
        </p>
        <h1 className="mt-8 font-[family:var(--font-display)] text-6xl leading-[0.9] tracking-[-0.03em] md:text-8xl lg:text-9xl">
          {t("common.error.title")} <br />
          <span className="italic text-[var(--gold)]">{t("common.error.titleAccent")}</span>
        </h1>
        <p className="mt-10 max-w-xl text-lg leading-relaxed text-[var(--muted)] handwritten">
          {t("common.error.description")}
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="btn-primary inline-flex min-h-12 items-center justify-center px-10 py-5 text-xs"
          >
            {t("common.error.retry")}
          </button>
          <Link
            href="/"
            className="btn-paper inline-flex min-h-12 items-center justify-center px-10 py-5 text-xs"
          >
            {t("common.error.home")}
          </Link>
        </div>
      </section>
    </div>
  );
}