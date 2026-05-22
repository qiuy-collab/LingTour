import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware reads the lingtour-locale cookie and passes it
 * to server components via a response header. This allows
 * layout.tsx to set the correct initial locale on the server,
 * eliminating the English flash on page load for ZH users.
 */
export function middleware(request: NextRequest) {
  const locale = request.cookies.get("lingtour-locale")?.value || "en";
  const response = NextResponse.next();
  response.headers.set("x-lingtour-locale", locale);
  return response;
}

export const config = {
  // Run on all pages but skip static assets and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
