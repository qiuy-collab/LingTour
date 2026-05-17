"use client";

import { useEffect, useState } from "react";

type Section = {
  id: string;
  label: string;
};

type Props = {
  sections: Section[];
};

export function SectionProgress({ sections }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function onScroll() {
      const viewH = window.innerHeight;
      const threshold = viewH * 0.4;

      let bestIndex = 0;
      let bestDist = Infinity;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // If the top of the section is above the threshold, this is likely the active one
        if (rect.top <= threshold) {
          bestIndex = i;
          break;
        }
        // Track the closest section above threshold
        if (rect.top < bestDist) {
          bestDist = rect.top;
          bestIndex = i;
        }
      }

      setActiveIndex(bestIndex);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  if (sections.length <= 1) return null;

  return (
    <nav className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <div className="flex flex-col items-end gap-3">
        {sections.map((section, i) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="group flex items-center gap-3"
          >
            <span
              className={`text-right text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${
                i === activeIndex
                  ? "text-[var(--cinnabar)] opacity-100"
                  : "text-[var(--muted)] opacity-0 group-hover:opacity-60"
              }`}
            >
              {section.label}
            </span>
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "h-2.5 w-2.5 bg-[var(--cinnabar)]"
                  : "h-1.5 w-1.5 bg-[var(--line)] group-hover:bg-[var(--cinnabar)]/40"
              }`}
            />
          </a>
        ))}
      </div>
    </nav>
  );
}
