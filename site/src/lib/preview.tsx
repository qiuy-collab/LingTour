"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/locale";

type PreviewType = "city" | "route" | "product";

type PreviewEnvelope<T> = {
  channel: "lingtour-preview";
  key: string;
  type: PreviewType;
  locale?: Locale;
  source?: string;
  data: T;
  timestamp: number;
};

const STORAGE_PREFIX = "lingtour-preview:";

function isLocale(value: unknown): value is Locale {
  return value === "zh" || value === "en";
}

function readStoredPreview<T>(key: string): PreviewEnvelope<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;
    return JSON.parse(raw) as PreviewEnvelope<T>;
  } catch {
    return null;
  }
}

function persistPreview<T>(key: string, envelope: PreviewEnvelope<T>) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(envelope));
  } catch {
    // Ignore storage failures in preview mode.
  }
}

export function usePreviewBridge<T>(expectedType: PreviewType) {
  const searchParams = useSearchParams();
  const previewKey = searchParams.get("previewKey") || "";
  const previewSource = searchParams.get("previewSource") || "";
  const previewEnabled = searchParams.get("preview") === "1" && previewKey.length > 0;

  const initialPreview = useMemo(() => {
    if (!previewEnabled) return null;
    const stored = readStoredPreview<T>(previewKey);
    if (!stored || stored.type !== expectedType) return null;
    return stored;
  }, [expectedType, previewEnabled, previewKey]);

  const [previewData, setPreviewData] = useState<T | null>(initialPreview?.data ?? null);
  const [previewLocale, setPreviewLocale] = useState<Locale | null>(
    initialPreview?.locale && isLocale(initialPreview.locale) ? initialPreview.locale : null,
  );

  useEffect(() => {
    if (!previewEnabled) {
      setPreviewData(null);
      setPreviewLocale(null);
      return;
    }

    const stored = readStoredPreview<T>(previewKey);
    if (stored && stored.type === expectedType) {
      setPreviewData(stored.data);
      setPreviewLocale(stored.locale && isLocale(stored.locale) ? stored.locale : null);
    }

    const handleMessage = (event: MessageEvent) => {
      const payload = event.data as PreviewEnvelope<T> | undefined;
      if (!payload || payload.channel !== "lingtour-preview") return;
      if (payload.type !== expectedType || payload.key !== previewKey) return;
      if (!previewSource || event.origin !== previewSource) return;
      if (payload.source && payload.source !== previewSource) return;

      persistPreview(previewKey, payload);
      setPreviewData(payload.data);
      setPreviewLocale(payload.locale && isLocale(payload.locale) ? payload.locale : null);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [expectedType, previewEnabled, previewKey, previewSource]);

  return {
    previewEnabled,
    previewKey,
    previewData,
    previewLocale,
  };
}
