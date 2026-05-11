"use client";

import { motion } from "framer-motion";

type Props = {
  cityName?: string;
};

export function CuratingPlaceholder({ cityName }: Props) {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center px-6 py-16 text-center">
      {/* Slowly rotating LingTour logo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="mb-10"
      >
        <p className="font-[family:var(--font-display)] text-3xl tracking-[0.08em] text-[var(--river-deep)] opacity-30">
          LingTour
        </p>
      </motion.div>

      {/* Editorial message */}
      <h2 className="mt-6 max-w-md font-[family:var(--font-display)] text-2xl leading-tight text-[var(--river-deep)] md:text-3xl">
        {cityName
          ? `Our editors are currently walking the streets of ${cityName} to curate its story.`
          : "This page is being curated by our editorial team."}
      </h2>
      <p className="mt-5 max-w-lg text-base leading-8 text-[var(--muted)]">
        Each city story, route, and object receives dedicated editorial attention before publication.
        This ensures every piece carries the cultural depth LingTour stands for.
      </p>

      {/* Email subscription — visual only */}
      <form className="mt-10 flex w-full max-w-md gap-3" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Your email for updates"
          className="flex-1 border border-[var(--line)] bg-white px-4 py-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--gold)]/60"
        />
        <button
          type="submit"
          className="bg-[var(--river-deep)] px-5 py-3 text-sm text-white transition hover:bg-[var(--night)]"
        >
          Notify me
        </button>
      </form>
      <p className="mt-3 text-xs text-[var(--muted)]">Join the waitlist to be notified when this page is ready.</p>
    </div>
  );
}
