/**
 * Lightweight locale store used by preview surfaces and translation helpers.
 *
 * The public site currently defaults to English, but preview flows and tests
 * still need a working locale state machine so components can temporarily
 * switch into Chinese copy without reloading the app.
 */

export type Locale = "en" | "zh";

const LOCALE_STORAGE_KEY = "lingtour-locale";
const DEFAULT_LOCALE: Locale = "en";
const listeners = new Set<(locale: Locale) => void>();

let currentLocale: Locale = DEFAULT_LOCALE;

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "zh";
}

function writeDocumentLanguage(locale: Locale) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("lang", locale);
  }
}

export function getLocale(): Locale {
  currentLocale = DEFAULT_LOCALE;
  return currentLocale;
}

export function setLocale(_locale: Locale): void {
  currentLocale = DEFAULT_LOCALE;

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, DEFAULT_LOCALE);
  }

  writeDocumentLanguage(DEFAULT_LOCALE);
  listeners.forEach((listener) => listener(DEFAULT_LOCALE));
}

export function subscribeToLocale(
  cb: (locale: Locale) => void,
): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function isZh(locale: Locale): boolean {
  return locale === "zh";
}
