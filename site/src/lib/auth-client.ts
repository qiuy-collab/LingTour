"use client";

import { apiPost } from "@/lib/api-client";

export type LocalUser = {
  id: string;
  accountId: string;
  name: string;
  email: string;
  role?: string;
  country?: string;
  travelStyle?: string;
  provider?: string;
  memberSince?: string;
  avatarUrl?: string;
};

export type AuthResponse = {
  access_token: string;
  expires_in: string;
  user: {
    id: string;
    accountId: string;
    email: string;
    role: string;
    name: string | null;
  };
};

export function readStoredUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem("lingtour-user");
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function persistAuthUser(
  user: AuthResponse["user"],
  overrides: Partial<LocalUser> = {},
) {
  const localUser: LocalUser = {
    id: user.id,
    accountId: user.accountId,
    name: user.name || "LingTour Guest",
    email: user.email,
    role: user.role,
    ...overrides,
  };

  window.localStorage.setItem("lingtour-user", JSON.stringify(localUser));
  window.dispatchEvent(new Event("lingtour-auth"));
  return localUser;
}

export async function signInWithGoogle(payload?: {
  email?: string;
  name?: string;
}) {
  const data = await apiPost<AuthResponse>("/auth/google", {
    email: payload?.email || "google@lingtour.local",
    name: payload?.name || "Google Traveler",
  });

  window.localStorage.setItem("lingtour-token", data.access_token);
  persistAuthUser(data.user, { provider: "Google" });
  return data;
}
