import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "culvoy_session";
const ACTION_PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  google: "/auth/google",
  "email-code": "/auth/email-code/verify",
} as const;

type Action = keyof typeof ACTION_PATHS;
type AuthPayload = {
  access_token: string;
  expires_in: string;
  user: unknown;
};

function getApiOrigin(): string {
  const value = process.env.INTERNAL_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || "";
  if (!value.startsWith("http")) {
    throw new Error("A server API origin is required for traveler sessions");
  }
  return value.replace(/\/$/, "");
}

function sessionMaxAge(token: string): number {
  try {
    const [, payload] = token.split(".");
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    if (typeof parsed.exp === "number") {
      return Math.max(1, Math.min(parsed.exp - Math.floor(Date.now() / 1000), 60 * 60 * 24));
    }
  } catch {
    // The API is authoritative for token validity; this only chooses cookie lifetime.
  }
  return 60 * 60 * 24;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

/**
 * Cookie-exchange endpoints must reject cross-site deliveries: a login CSRF
 * would otherwise sign a victim's browser into an attacker-controlled
 * account via an auto-submitted cross-origin form (report P2-L).
 * Browsers always attach Sec-Fetch-Site and an Origin on POST; requests
 * with neither are non-browser tools that hold no session context.
 */
function isSameSiteDelivery(request: NextRequest): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin") {
    return false;
  }

  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameSiteDelivery(request)) {
    return NextResponse.json({ message: "Cross-site session requests are not allowed" }, { status: 403 });
  }

  let body: { action?: unknown; payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid session request" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action as Action : undefined;
  if (!action || !(action in ACTION_PATHS) || !body.payload || typeof body.payload !== "object") {
    return NextResponse.json({ message: "Invalid authentication action" }, { status: 400 });
  }

  const response = await fetch(`${getApiOrigin()}${ACTION_PATHS[action]}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "Accept-Language": "en" },
    body: JSON.stringify(body.payload),
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({ message: response.statusText }));
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const auth = data as AuthPayload;
  if (!auth.access_token || !auth.user) {
    return NextResponse.json({ message: "Invalid authentication response" }, { status: 502 });
  }

  const result = NextResponse.json({ user: auth.user });
  result.cookies.set(SESSION_COOKIE, auth.access_token, cookieOptions(sessionMaxAge(auth.access_token)));
  return result;
}

export function DELETE(request: NextRequest) {
  if (!isSameSiteDelivery(request)) {
    return NextResponse.json({ message: "Cross-site session requests are not allowed" }, { status: 403 });
  }
  const result = NextResponse.json({ ok: true });
  result.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(0), maxAge: 0 });
  return result;
}
