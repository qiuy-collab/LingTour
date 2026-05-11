/**
 * Core locale utility — pure JS, works outside React.
 * Reads from / writes to localStorage and dispatches a custom event
 * so React components can subscribe via useEffect.
 */

export type Locale = "en" | "zh";

const STORAGE_KEY = "lingtour-locale";
const EVENT_NAME = "lingtour-locale";

const subscribers = new Set<(locale: Locale) => void>();

/** Read locale from localStorage, falling back to "en" */
export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "zh" ? "zh" : "en";
}

/** Write locale to localStorage and notify subscribers */
export function setLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute("lang", locale === "zh" ? "zh-CN" : "en");
  window.dispatchEvent(new Event(EVENT_NAME));
  subscribers.forEach((cb) => cb(locale));
}

/** Subscribe to locale changes. Returns unsubscribe function. */
export function subscribeToLocale(cb: (locale: Locale) => void): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

/** Shortcut to check if locale is Chinese */
export function isZh(locale: Locale): boolean {
  return locale === "zh";
}
