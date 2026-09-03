import { NextResponse } from "next/server";

// Keep the hook inert without running it for every document and RSC navigation.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/__lingtour_proxy_disabled__"],
};
