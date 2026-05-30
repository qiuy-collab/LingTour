import { NextResponse } from "next/server";

/**
 * English-only site proxy. Keep this lightweight hook so future request-level
 * middleware can be added without reintroducing language negotiation.
 */
export function proxy() {
  return NextResponse.next();
}

export const config = {
  // Run on all pages but skip static assets and API routes
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
