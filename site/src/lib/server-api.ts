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

/**
 * Build the absolute API URL for a server-side request.
 *
 * Priority:
 *  1. INTERNAL_API_ORIGIN server-only env var (e.g. "http://api:8000/api/v1")
 *  2. NEXT_PUBLIC_API_URL env var (e.g. "https://api.lingfengtranstour.cn/api/v1")
 *  3. Same-origin fallback using the incoming request's Host header
 */
async function getServerBaseUrl(): Promise<string> {
  const internalUrl = process.env.INTERNAL_API_ORIGIN;
  if (internalUrl?.startsWith("http")) return internalUrl;

  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl?.startsWith("http")) return envUrl;

  const requestHeaders = await headers();
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3001";
  const sameOriginBase = new URL(envUrl || "/api/v1", `${proto}://${host}`);

  return sameOriginBase.toString().replace(/\/$/, "");
}

/**
 * Server-side GET request.
 *
 * Unlike the client `apiGet`, this does NOT depend on `window` or `localStorage`.
 */
export async function serverGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  const baseUrl = await getServerBaseUrl();
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
    // The storefront is English-only.
    "Accept-Language": "en",
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
