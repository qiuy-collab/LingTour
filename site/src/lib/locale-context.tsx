"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getLocale, subscribeToLocale, type Locale } from "@/lib/locale";
import { translate, dictionaries } from "@/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getLocale());

  // Subscribe to external changes
  useEffect(() => {
    return subscribeToLocale((l) => setLocaleState(l));
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lingtour-locale", l);
      document.documentElement.setAttribute("lang", l === "zh" ? "zh-CN" : "en");
      window.dispatchEvent(new Event("lingtour-locale"));
    }
  }, []);

  const t = useCallback(
    (key: string) => translate(key, locale),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Fallback for serverside — return default English
    return {
      locale: "en",
      setLocale: () => {},
      t: (key: string) => translate(key, "en"),
    };
  }
  return ctx;
}
