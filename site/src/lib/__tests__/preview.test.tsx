import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePreviewBridge } from "../preview";

const KEY = "admin-preview:route:test";
const SOURCE = "https://admin.example.com";

function setPreviewUrl() {
  window.history.replaceState(
    {},
    "",
    `/?preview=1&previewKey=${encodeURIComponent(KEY)}&previewSource=${encodeURIComponent(SOURCE)}`,
  );
}

describe("usePreviewBridge popup handshake", () => {
  afterEach(() => {
    window.sessionStorage.clear();
    Object.defineProperty(window, "opener", { configurable: true, value: null });
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
  });

  it("announces readiness to the configured opener origin", async () => {
    setPreviewUrl();
    const opener = { postMessage: vi.fn() };
    Object.defineProperty(window, "opener", { configurable: true, value: opener });

    renderHook(() => usePreviewBridge<{ title: string }>("route"));

    await waitFor(() => {
      expect(opener.postMessage).toHaveBeenCalledWith(
        {
          channel: "lingtour-preview-ready",
          key: KEY,
          type: "route",
        },
        SOURCE,
      );
    });
  });

  it("accepts a matching draft only from the opener window", async () => {
    setPreviewUrl();
    const opener = { postMessage: vi.fn() };
    Object.defineProperty(window, "opener", { configurable: true, value: opener });
    const { result } = renderHook(() =>
      usePreviewBridge<{ title: string }>("route"),
    );

    await waitFor(() => expect(result.current.previewEnabled).toBe(true));

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: SOURCE,
          source: {} as Window,
          data: {
            channel: "lingtour-preview",
            key: KEY,
            type: "route",
            source: SOURCE,
            data: { title: "Wrong sender" },
            timestamp: 1,
          },
        }),
      );
    });
    expect(result.current.previewData).toBeNull();

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: SOURCE,
          source: opener as unknown as Window,
          data: {
            channel: "lingtour-preview",
            key: KEY,
            type: "route",
            source: SOURCE,
            data: { title: "Unsaved popup draft" },
            timestamp: 2,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(result.current.previewData).toEqual({
        title: "Unsaved popup draft",
      });
    });
    expect(window.sessionStorage.getItem(`lingtour-preview:${KEY}`)).toContain(
      "Unsaved popup draft",
    );
  });
});
