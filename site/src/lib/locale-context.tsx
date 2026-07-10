"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import {
  setLocale as setStoredLocale,
  type Locale,
} from "@/lib/locale";
import { translate } from "@/translations";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => translate(key, "en"),
});

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function LocaleProvider({
  children,
  initialLocale: _initialLocale,
}: LocaleProviderProps) {
  const locale: Locale = "en";

  useEffect(() => {
    setStoredLocale("en");
  }, []);

  const setLocale = useCallback((_nextLocale: Locale) => {
    setStoredLocale("en");
  }, []);

  const t = useCallback((key: string) => translate(key, "en"), []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  return useContext(LocaleContext);
}
