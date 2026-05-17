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
      className="relative h-screen w-full overflow-hidden"
      style={{ background: "var(--route-bg)" }}
    >
      {/* Background image 鈥?parallax layer */}
      <motion.div
        className="absolute inset-0"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [1, 0.2]) }}
      >
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
        />
      </motion.div>

      {/* Dark overlay on scroll */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "#1A2A3A", opacity: overlayOpacity }}
      />

      {/* Grain texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.04]" />

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
          className="text-xs uppercase tracking-[0.28em]"
          style={{ color: "var(--route-gold)" }}
        >
          Story Route
        </motion.p>

        {/* Decorative gold lines */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-5 h-px w-16 origin-center"
          style={{ background: "var(--route-gold)" }}
        />

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-7 font-serif text-5xl leading-[1.08] tracking-tight md:text-7xl lg:text-8xl"
          style={{ color: "var(--route-text)" }}
        >
          {title}
        </motion.h1>

        {/* Gold accent line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-8 h-px w-24 origin-center"
          style={{ background: "var(--route-gold)" }}
        />

        {/* Summary */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.25 }}
          className="mt-8 max-w-lg text-sm leading-relaxed"
          style={{ color: "var(--route-text)" }}
        >
          {summary}
        </motion.p>

        {/* Blinking down arrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="absolute bottom-10"
        >
          <div
            className="blink-arrow text-lg"
            style={{ color: "var(--route-gold)" }}
          >
            鈫?          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}


