import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AuthUser, LocalUser } from "@/lib/auth-client";

export const SESSION_COOKIE = "lingtour_session";

function getInternalApiBase(): string {
  const origin = process.env.INTERNAL_API_ORIGIN || process.env.NEXT_PUBLIC_API_URL || "";
  if (!origin.startsWith("http")) {
    throw new Error("A server API origin is required for authenticated routes");
  }
  return origin.replace(/\/$/, "");
}

export function loginDestination(pathname: string, search = ""): string {
  const next = `${pathname}${search}`;
  return `/login?next=${encodeURIComponent(next)}`;
}

export function toServerLocalUser(user: AuthUser): LocalUser {
  return {
    id: user.id,
    accountId: user.accountId,
    name: user.name || "Culvoy Guest",
    email: user.email,
    role: user.role,
    country: user.country ?? "",
    homeBase: user.homeBase ?? "",
    travelStyle: user.travelStyle ?? "",
    provider: user.provider ?? "",
    memberSince: user.memberSince ?? "",
    avatarUrl: user.avatarUrl ?? "",
    bio: user.bio ?? "",
    profileVisibility: user.profileVisibility ?? "public",
    dispatchCount: user.dispatchCount ?? 0,
    photoDispatchCount: user.photoDispatchCount ?? 0,
    latestDispatchAt: user.latestDispatchAt ?? null,
    latestDispatchTitle: user.latestDispatchTitle ?? null,
  };
}

export async function requireTraveler(pathname = "/profile", search = ""): Promise<AuthUser> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) redirect(loginDestination(pathname, search));

  const response = await fetch(`${getInternalApiBase()}/auth/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Accept-Language": "en" },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    redirect(loginDestination(pathname, search));
  }
  if (!response.ok) {
    throw new Error(`Unable to verify traveler session: ${response.status}`);
  }

  return response.json() as Promise<AuthUser>;
}
