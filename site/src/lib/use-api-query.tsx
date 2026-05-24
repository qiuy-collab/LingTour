"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseApiQueryOptions {
  /** Keep previous data while new request is in-flight (default: true) */
  keepPreviousData?: boolean;
  /** Number of retry attempts on failure (default: 2) */
  retryCount?: number;
  /** Base delay in ms between retries, doubles each attempt (default: 1000) */
  retryDelay?: number;
  /** When false, skip the fetch entirely (default: true) */
  enabled?: boolean;
}

type Fetcher<T> = () => Promise<T>;

/**
 * Generic async query hook for API data fetching.
 *
 * Returns `{ data, loading, error, refetch }` so every page
 * can render loading / error / success states uniformly.
 *
 * Supports stale-while-revalidate (keepPreviousData), automatic
 * retry with exponential backoff, and conditional fetching (enabled).
 */
export function useApiQuery<T>(
  fetcher: Fetcher<T>,
  deps: unknown[] = [],
  options: UseApiQueryOptions = {},
): AsyncState<T> {
  const {
    keepPreviousData = true,
    retryCount = 2,
    retryDelay = 1000,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const refetch = useCallback(() => {
    setVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    if (!keepPreviousData) {
      setData(null);
    }
    setLoading(true);
    setError(null);

    const attemptFetch = async (attempt: number): Promise<void> => {
      try {
        const result = await fetcherRef.current();
        if (!cancelled && mountedRef.current) {
          setData(result);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (cancelled || !mountedRef.current) return;

        if (attempt < retryCount) {
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise<void>((resolve) => {
            setTimeout(resolve, delay);
          });
          if (!cancelled && mountedRef.current) {
            return attemptFetch(attempt + 1);
          }
        } else if (!cancelled && mountedRef.current) {
          setError(err instanceof Error ? err.message : "An error occurred");
          setLoading(false);
        }
      }
    };

    attemptFetch(0);

    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, enabled, keepPreviousData, retryCount, retryDelay, ...deps]);

  return { data, loading, error, refetch };
}

// Shared loading/error components

/**
 * Lightweight loading state used while data is in-flight.
 *
 * Default copy is intentionally restrained ("Opening the file…") to fit the
 * journal aesthetic. Callers can still override `text` for context-specific
 * wording.
 */
export function LoadingSpinner({
  text = "Opening the file…",
}: {
  text?: string;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--line)] border-t-[var(--cinnabar)]" />
        <p className="mt-4 text-sm text-[var(--muted)] handwritten">{text}</p>
      </div>
    </div>
  );
}

/**
 * Friendly error state. Defaults shape the wording around "we couldn't reach
 * the archive". Callers can pass a more specific `message` when useful.
 */
export function ErrorState({
  message = "We couldn't reach the archive right now. Please try again in a moment.",
  onRetry,
  title = "Something went wrong",
}: {
  message?: string;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[var(--cinnabar)]">
          ! {title}
        </p>
        <p className="mt-4 text-base leading-relaxed text-[var(--muted)] handwritten">
          {message}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-8 border border-[var(--line)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--ink)] transition hover:bg-[var(--night)] hover:text-white"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
