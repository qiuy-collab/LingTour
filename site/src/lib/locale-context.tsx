"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { setLocale as setLocaleUtil, subscribeToLocale, type Locale } from "@/lib/locale";
import { translate } from "@/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
  /** Server-detected locale from cookie. Avoids flash of wrong language. */
  initialLocale?: Locale;
}

export function LocaleProvider({ children, initialLocale = "en" }: LocaleProviderProps) {
  // Start with server-provided locale to avoid hydration mismatch flash.
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  // After mount: sync from localStorage if user has a stored preference
  useEffect(() => {
    const stored = window.localStorage.getItem("lingtour-locale");
    // Only override if localStorage has an explicit value
    if (stored === "zh" || stored === "en") {
      if (stored !== locale) {
        setLocaleState(stored);
      }
      document.documentElement.setAttribute("lang", stored === "zh" ? "zh-CN" : "en");
    } else {
      // No stored preference — keep initialLocale, sync lang attribute
      document.documentElement.setAttribute("lang", locale === "zh" ? "zh-CN" : "en");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to external changes (other tabs / programmatic setLocale)
  useEffect(() => {
    return subscribeToLocale((l) => setLocaleState(l));
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setLocaleUtil(l);
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
