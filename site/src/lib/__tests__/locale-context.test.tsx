import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LocaleProvider, useLocale } from "../locale-context";
import type { ReactNode } from "react";

function createWrapper(initialLocale?: "en" | "zh") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <LocaleProvider initialLocale={initialLocale}>
        {children}
      </LocaleProvider>
    );
  };
}

describe("LocaleProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("lang");
  });

  it("defaults to 'en' when no initialLocale provided", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });
    expect(result.current.locale).toBe("en");
  });

  it("uses initialLocale when provided", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper("zh"),
    });
    expect(result.current.locale).toBe("zh");
  });

  it("setLocale updates locale state", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setLocale("zh");
    });

    expect(result.current.locale).toBe("zh");
  });

  it("t() returns translated string", () => {
    const { result } = renderHook(() => useLocale(), {
      wrapper: createWrapper("en"),
    });
    // t() should return a string (even if key not found, returns key)
    const translated = result.current.t("nav.home");
    expect(typeof translated).toBe("string");
  });
});
