"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

type Props = {
  title: string;
  summary: string;
  image: string;
};

export function IntroHero({ title, summary, image }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.6], [0, 0.8]);

  return (
    <div
      ref={ref}
      className="relative h-screen w-full overflow-hidden bg-grain"
      style={{ background: "var(--background)" }}
    >
      {/* Background image — parallax layer */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [0.6, 0.1]) }}
      >
        <div
          className="h-full w-full bg-cover bg-center grayscale contrast-[0.9] brightness-[1.05]"
          style={{ backgroundImage: `url(${image})` }}
        />
      </motion.div>

      {/* Editorial overlay on scroll */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "var(--paper-deep)", opacity: overlayOpacity }}
      />

      {/* Grain texture overlay — increased for tactile feel */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.08]" />

      {/* Content */}
      <motion.div
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
        style={{ y: titleY, opacity: titleOpacity }}
      >
        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-xs uppercase tracking-[0.4em] font-bold"
          style={{ color: "var(--cinnabar)" }}
        >
          Field Discovery / Story Route
        </motion.p>

        {/* Decorative gold lines */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 h-px w-20 origin-center"
          style={{ background: "var(--gold)" }}
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-10 font-[family:var(--font-display)] text-6xl leading-[0.9] tracking-tight md:text-8xl lg:text-9xl"
          style={{ color: "var(--river-deep)" }}
        >
          {title.split(' ').map((word, i) => (
            <span key={i} className={i % 2 === 1 ? 'italic text-[var(--gold)] block md:inline' : ''}>
              {word}{' '}
            </span>
          ))}
        </motion.h1>

        {/* Summary */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.25 }}
          className="mt-12 max-w-xl text-xl leading-relaxed handwritten"
          style={{ color: "var(--muted)" }}
        >
          {summary}
        </motion.p>

        {/* Blinking down arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="absolute bottom-12 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)] [writing-mode:vertical-lr]">Explore</span>
          <div
            className="blink-arrow text-xl"
            style={{ color: "var(--gold)" }}
          >
            ↓
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
