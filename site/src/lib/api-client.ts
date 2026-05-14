/**
 * Unified API Client for LingTour frontend.
 *
 * - Reads NEXT_PUBLIC_API_URL from environment
 * - Injects JWT Bearer token from localStorage (lingtour-token)
 * - Injects Accept-Language header from locale preference (lingtour-locale)
 * - Uniform error handling
 */

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
}

export type ApiError = {
  statusCode: number;
  message: string;
  error?: string;
};

export class ApiRequestError extends Error {
  statusCode: number;
  error?: string;

  constructor({ statusCode, message, error }: ApiError) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** URL query parameters */
  params?: Record<string, string | number | undefined>;
  /** JSON body — will be JSON.stringify'd and Content-Type set automatically */
  body?: unknown;
}

/**
 * Core request function. Every public API call in the app goes through here.
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { params, body, headers: customHeaders, ...rest } = options;
  const baseUrl = getBaseUrl();

  // ── Build URL ──
  const fullPath = `${baseUrl}${endpoint}`;
  const url = new URL(
    fullPath,
    fullPath.startsWith("http") ? undefined : window.location.origin,
  );
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  // ── Build headers ──
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customHeaders as Record<string, string>),
  };

  // JSON content-type for request bodies
  if (body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // JWT auth token
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lingtour-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Locale header → backend I18nInterceptor resolves {en,zh} objects
  if (typeof window !== "undefined") {
    const locale = localStorage.getItem("lingtour-locale");
    if (locale === "zh") {
      headers["Accept-Language"] = "zh-CN";
    }
  }

  // ── Fire request ──
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiRequestError({
      statusCode: 0,
      message: err instanceof Error ? err.message : "Network error — unable to reach server",
    });
  }

  // ── Handle non-2xx ──
  if (!response.ok) {
    let apiError: ApiError;
    try {
      apiError = (await response.json()) as ApiError;
    } catch {
      apiError = {
        statusCode: response.status,
        message: response.statusText || `Request failed with status ${response.status}`,
      };
    }
    throw new ApiRequestError(apiError);
  }

  // ── Parse JSON response ──
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as unknown as T;
}

// ───────────── Convenience wrappers ─────────────

export function apiGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
): Promise<T> {
  return apiClient<T>(endpoint, { method: "GET", params });
}

export function apiPost<T = unknown>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  return apiClient<T>(endpoint, { method: "POST", body });
}

export function apiPut<T = unknown>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  return apiClient<T>(endpoint, { method: "PUT", body });
}

export function apiPatch<T = unknown>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  return apiClient<T>(endpoint, { method: "PATCH", body });
}

export function apiDelete<T = unknown>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}
