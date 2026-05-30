/**
 * English-only locale compatibility helpers.
 *
 * The public site no longer exposes language switching. A tiny Locale type and
 * no-op helpers remain so data mappers can keep accepting a locale argument
 * while always resolving English copy.
 */

export type Locale = "en" | "zh";

export function getLocale(): Locale {
  return "en";
}

export function setLocale(_locale: Locale): void {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", "en");
  }
}

export function subscribeToLocale(_cb: (locale: Locale) => void): () => void {
  return () => {};
}

export function isZh(_locale: Locale): boolean {
  return false;
}
