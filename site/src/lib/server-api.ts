/**
 * Server-only API helper.
 *
 * This module is imported ONLY by Server Components / server-side code.
 * It uses Node.js `fetch` (available in Next.js server runtime) and reads
 * configuration from environment variables + request headers instead of
 * `window` / `localStorage`.
 *
 * Do NOT import this from any `"use client"` file.
 */

import { headers } from "next/headers";
import type { Locale } from "./locale";

/**
 * Build the absolute API URL for a server-side request.
 *
 * Priority:
 *  1. NEXT_PUBLIC_API_URL env var (e.g. "https://api.lingfengtranstour.cn/api/v1")
 *  2. Same-origin fallback using the incoming request's Host header
 */
function getServerBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // Fallback: construct from incoming request (works in SSR behind proxy)
  // In production this will typically not be reached because NEXT_PUBLIC_API_URL is set.
  return "/api/v1";
}

/**
 * Server-side GET request.
 *
 * Unlike the client `apiGet`, this does NOT depend on `window` or `localStorage`.
 * Locale is passed explicitly via `Accept-Language` header.
 */
export async function serverGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
  locale?: Locale,
): Promise<T> {
  const baseUrl = getServerBaseUrl();
  const fullPath = `${baseUrl}${endpoint}`;

  // Build URL — use absolute URL when base starts with http
  const url = fullPath.startsWith("http")
    ? new URL(fullPath)
    : new URL(fullPath, "http://localhost");

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headersInit: Record<string, string> = {
    Accept: "application/json",
  };

  const response = await fetch(url.toString(), {
    headers: headersInit,
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error(
      `API ${endpoint} returned ${response.status}: ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as unknown as T;
}
