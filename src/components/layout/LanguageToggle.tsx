"use client";

import { useEffect, useState } from "react";

type LocaleMode = "en" | "zh";

function readLocale(): LocaleMode {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem("lingtour-locale");
  return stored === "zh" ? "zh" : "en";
}

export function LanguageToggle() {
  const [locale, setLocale] = useState<LocaleMode>(() => readLocale());

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale === "zh" ? "zh-CN" : "en");
    window.localStorage.setItem("lingtour-locale", locale);
    window.dispatchEvent(new Event("lingtour-locale"));
  }, [locale]);

  return (
    <button
      type="button"
      aria-label="Toggle English and Chinese"
      className="inline-flex h-10 items-center gap-1.5 px-2 text-xs font-semibold text-[var(--muted)] transition hover:text-[var(--river-deep)]"
      onClick={() => setLocale((current) => (current === "en" ? "zh" : "en"))}
    >
      <span
        className={`border-b pb-0.5 transition ${
          locale === "en" ? "border-[var(--cinnabar)] text-[var(--river-deep)]" : "border-transparent"
        }`}
      >
        EN
      </span>
      <span className="text-[var(--line)]">/</span>
      <span
        className={`border-b pb-0.5 transition ${
          locale === "zh" ? "border-[var(--cinnabar)] text-[var(--river-deep)]" : "border-transparent"
        }`}
      >
        ZH
      </span>
    </button>
  );
}
