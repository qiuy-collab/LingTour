import { common } from "./common";
import { home } from "./home";
import { culture } from "./culture";
import { routes } from "./routes";
import { interpreting } from "./interpreting";
import { shop } from "./shop";
import { about } from "./about";
import { account } from "./account";
import { checkout } from "./checkout";
import type { Locale } from "@/lib/locale";

type DictValue = string | number | boolean | null | undefined;

// Merge all module translations into one flat lookup
const allModules = [common, home, culture, routes, interpreting, shop, about, account, checkout];

export const dictionaries: Record<Locale, Record<string, DictValue>> = {
  en: {},
  zh: {},
};

for (const mod of allModules) {
  Object.assign(dictionaries.en, mod.en);
  Object.assign(dictionaries.zh, mod.zh);
}

/** Translate a key into the given locale. Falls back to English, then a readable missing-key label. */
export function translate(key: string, locale: Locale): string {
  const val = dictionaries[locale]?.[key];
  if (val !== undefined && val !== null) return String(val);
  // Fall back to English.
  const fallback = dictionaries.en[key];
  if (fallback !== undefined && fallback !== null) return String(fallback);
  return `Missing translation: ${key}`;
}

/** Get all translation keys for a locale (for debugging) */
export function getKeys(locale: Locale): string[] {
  return Object.keys(dictionaries[locale]);
}

