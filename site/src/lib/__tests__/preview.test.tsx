import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePreviewBridge } from "../preview";

const KEY = "admin-preview:route:test";
// P2-M: the bridge only accepts origins on the hard-coded allowlist, so
// tests must use the production admin origin.
const SOURCE = "https://admin.culvoy.com";

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
          channel: "culvoy-preview-ready",
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
            channel: "culvoy-preview",
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
            channel: "culvoy-preview",
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
    expect(window.sessionStorage.getItem(`culvoy-preview:${KEY}`)).toContain(
      "Unsaved popup draft",
    );
  });

  it("ignores a previewSource outside the allowlist (P2-M)", async () => {
    const evil = "https://evil.example.com";
    window.history.replaceState(
      {},
      "",
      `/?preview=1&previewKey=${encodeURIComponent(KEY)}&previewSource=${encodeURIComponent(evil)}`,
    );
    const opener = { postMessage: vi.fn() };
    Object.defineProperty(window, "opener", { configurable: true, value: opener });
    const { result } = renderHook(() =>
      usePreviewBridge<{ title: string }>("route"),
    );

    await waitFor(() => expect(result.current.previewEnabled).toBe(true));

    // No readiness handshake towards the untrusted origin.
    expect(opener.postMessage).not.toHaveBeenCalled();

    // A draft posted from the untrusted origin must be dropped.
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: evil,
          source: opener as unknown as Window,
          data: {
            channel: "culvoy-preview",
            key: KEY,
            type: "route",
            source: evil,
            data: { title: "Phished draft" },
            timestamp: 3,
          },
        }),
      );
    });
    expect(result.current.previewData).toBeNull();
    expect(window.sessionStorage.getItem(`culvoy-preview:${KEY}`)).toBeNull();
  });
});
