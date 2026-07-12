/**
 * Unified API Client for LingTour frontend.
 *
 * - Reads NEXT_PUBLIC_API_URL from environment
 * - Injects JWT Bearer token from localStorage (lingtour-token)
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
  /** Request body. Plain objects are JSON-stringified automatically. */
  body?: unknown;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isBodyInit(value: unknown): value is BodyInit {
  if (typeof value === "string") return true;
  if (typeof FormData !== "undefined" && value instanceof FormData) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) return true;
  if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) return true;
  if (typeof ReadableStream !== "undefined" && value instanceof ReadableStream) return true;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value)) return true;
  return false;
}

function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined;
  if (isBodyInit(body)) {
    return body;
  }
  if (isPlainObject(body) || Array.isArray(body)) {
    return JSON.stringify(body);
  }
  return String(body);
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

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customHeaders as Record<string, string>),
    // The public site is English-only, including client-side refreshes.
    "Accept-Language": "en",
  };

  const requestBody = serializeBody(body);
  const isMultipart = typeof FormData !== "undefined" && body instanceof FormData;

  if (requestBody !== undefined && !isMultipart && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lingtour-token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...rest,
      headers,
      body: requestBody,
    });
  } catch (err) {
    throw new ApiRequestError({
      statusCode: 0,
      message: err instanceof Error ? err.message : "Network error - unable to reach server",
    });
  }

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

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return (await response.text()) as unknown as T;
}

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
