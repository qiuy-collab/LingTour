"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

type Fetcher<T> = () => Promise<T>;

/**
 * Generic async query hook for API data fetching.
 *
 * Returns `{ data, loading, error, refetch }` so every page
 * can render loading / error / success states uniformly.
 */
export function useApiQuery<T>(
  fetcher: Fetcher<T>,
  deps: unknown[] = [],
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  // Track mounted state to avoid setting state on unmounted component
  const mountedRef = useRef(true);
  
  // Store fetcher in a ref to avoid it being a dependency of execute
  const fetcherRef = useRef(fetcher);
  
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const execute = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef
      .current()
      .then((result) => {
        if (!cancelled && mountedRef.current) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && mountedRef.current) {
          setError(err instanceof Error ? err.message : "An error occurred");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refetch = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    const cancel = execute();
    return () => {
      mountedRef.current = false;
      cancel?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, version, ...deps]);

  return { data, loading, error, refetch };
}

// ───────────── Shared loading/error components ─────────────

export function LoadingSpinner({
  text = "Loading…",
}: {
  text?: string;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--cinnabar)]" />
        <p className="mt-4 text-sm text-[var(--muted)]">{text}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-[var(--cinnabar)]">Error</p>
        <p className="mt-2 text-sm text-[var(--muted)]">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 border border-[var(--line)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--ink)] transition hover:bg-[var(--night)] hover:text-white"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
