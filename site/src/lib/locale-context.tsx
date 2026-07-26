"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { translate } from "@/translations";

interface CopyContextValue {
  /** Look up a UI string by key. */
  t: (key: string) => string;
}

const CopyContext = createContext<CopyContextValue>({ t: translate });

export function LocaleProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({ t: translate }), []);

  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

export function useLocale(): CopyContextValue {
  return useContext(CopyContext);
}
