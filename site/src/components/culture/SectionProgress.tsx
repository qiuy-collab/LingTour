"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SectionDef = {
  id: string;
  label: string;
};

type Props = {
  sections: SectionDef[];
};

export function SectionProgress({ sections }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  // Store the latest activeIndex in a ref so the scroll handler always reads the freshest value
  const activeRef = useRef(0);
  // Store section IDs in a ref
  const sectionIds = useRef(sections.map((s) => s.id));

  // Keep sectionIds ref in sync
  useEffect(() => {
    sectionIds.current = sections.map((s) => s.id);
  }, [sections]);

  const computeActive = useCallback(() => {
    const ids = sectionIds.current;
    let found = 0;
    for (let i = ids.length - 1; i >= 0; i--) {
      const el = document.getElementById(ids[i]);
      if (!el) continue;
      const top = el.getBoundingClientRect().top;
      // If this section's top is above 40% of viewport, it's "active"
      if (top < window.innerHeight * 0.4) {
        found = i;
        break;
      }
    }
    if (found !== activeRef.current) {
      activeRef.current = found;
      setActiveIndex(found);
    }
  }, []);

  useEffect(() => {
    // Compute immediately
    computeActive();

    // Scroll listener
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          computeActive();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Use both window and document scroll for maximum compatibility
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, { passive: true });

    // Also poll every 300ms as a safety net
    const interval = setInterval(computeActive, 300);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll);
      clearInterval(interval);
    };
  }, [computeActive]);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-4 top-1/2 z-40 -translate-y-1/2"
      style={{ display: "block" }}
    >
      <ul className="flex flex-col items-end gap-5">
        {sections.map((sec, i) => (
          <li key={sec.id}>
            <button
              type="button"
              onClick={() => scrollTo(sec.id)}
              className="group flex items-center gap-3"
            >
              <span
                className={`text-xs transition-all duration-300 ${
                  i === activeIndex
                    ? "text-[var(--cinnabar)] opacity-100"
                    : "text-[var(--muted)] opacity-0 group-hover:opacity-60"
                }`}
              >
                {sec.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "h-2.5 w-2.5 bg-[var(--cinnabar)]"
                    : "h-1.5 w-1.5 bg-[var(--muted)] group-hover:h-2 group-hover:w-2"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
