"use client";

import { useState } from "react";

type FaqItem = {
  question: string;
  answer: string;
};

type InterpretingFaqAccordionProps = {
  items: FaqItem[];
};

export function InterpretingFaqAccordion({ items }: InterpretingFaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="grid gap-3">
      {items.map((item, index) => {
        const open = openIndex === index;

        return (
          <article
            key={item.question}
            className="overflow-hidden border border-[var(--line)] bg-[var(--paper)] transition-colors duration-300 hover:border-[var(--gold)]/45"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-start justify-between gap-6 px-5 py-5 text-left sm:px-6"
              aria-expanded={open}
            >
              <div>
                <p className="text-label text-[var(--gold)]">0{index + 1}</p>
                <h3 className="mt-3 font-[family:var(--font-display)] text-xl leading-snug text-[var(--river-deep)] sm:text-2xl">
                  {item.question}
                </h3>
              </div>
              <span
                className={`mt-1 text-2xl leading-none text-[var(--gold)] transition-transform duration-300 ${
                  open ? "rotate-45" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            <div
              className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-[var(--line)] px-5 py-5 sm:px-6">
                  <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
