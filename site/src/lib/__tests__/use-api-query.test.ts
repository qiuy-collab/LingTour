import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useApiQuery } from "../use-api-query";

describe("useApiQuery", () => {
  it("returns data on successful fetch", async () => {
    const fetcher = vi.fn().mockResolvedValue({ name: "test" });
    const { result } = renderHook(() => useApiQuery(fetcher));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ name: "test" });
    expect(result.current.error).toBeNull();
  });

  it("sets error after all retries fail", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() =>
      useApiQuery(fetcher, [], { retryCount: 1, retryDelay: 10 }),
    );

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
      },
      { timeout: 3000 },
    );

    expect(result.current.error).toBe("Network error");
    expect(result.current.data).toBeNull();
    // 1 initial + 1 retry = 2 calls
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("keeps previous data when keepPreviousData is true (default)", async () => {
    let counter = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      counter++;
      return { count: counter };
    });

    const { result, rerender } = renderHook(
      ({ dep }) => useApiQuery(fetcher, [dep]),
      { initialProps: { dep: 1 } },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 1 });
    });

    // Change dep — data should remain while loading
    rerender({ dep: 2 });
    expect(result.current.data).toEqual({ count: 1 }); // stale data preserved
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.data).toEqual({ count: 2 });
    });
  });

  it("skips fetch when enabled is false", async () => {
    const fetcher = vi.fn().mockResolvedValue("data");

    const { result } = renderHook(() =>
      useApiQuery(fetcher, [], { enabled: false }),
    );

    // Should not be loading and should not call fetcher
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("refetch triggers a new request", async () => {
    let counter = 0;
    const fetcher = vi.fn().mockImplementation(async () => {
      counter++;
      return counter;
    });

    const { result } = renderHook(() => useApiQuery(fetcher));

    await waitFor(() => {
      expect(result.current.data).toBe(1);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toBe(2);
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
