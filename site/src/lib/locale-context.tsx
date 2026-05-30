"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/lib/locale";
import { translate } from "@/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const ENGLISH_CONTEXT: LocaleContextValue = {
  locale: "en",
  setLocale: () => {},
  t: (key: string) => translate(key, "en"),
};

const LocaleContext = createContext<LocaleContextValue>(ENGLISH_CONTEXT);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  return (
    <LocaleContext.Provider value={ENGLISH_CONTEXT}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
