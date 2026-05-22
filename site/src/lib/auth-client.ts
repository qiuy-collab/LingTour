"use client";

import { apiGet, apiPatch, apiPost } from "@/lib/api-client";

export type ProfileVisibility = "public" | "community" | "private";

export type LocalUser = {
  id: string;
  accountId: string;
  name: string;
  email: string;
  role?: string;
  country?: string;
  homeBase?: string;
  travelStyle?: string;
  provider?: string;
  memberSince?: string;
  avatarUrl?: string;
  bio?: string;
  profileVisibility?: ProfileVisibility;
  dispatchCount?: number;
  photoDispatchCount?: number;
  latestDispatchAt?: string | null;
  latestDispatchTitle?: string | null;
};

export type AuthUser = {
  id: string;
  accountId: string;
  email: string;
  role: string;
  name: string | null;
  avatarUrl?: string;
  country?: string;
  homeBase?: string;
  travelStyle?: string;
  provider?: string;
  memberSince?: string;
  bio?: string;
  profileVisibility?: ProfileVisibility;
  dispatchCount?: number;
  photoDispatchCount?: number;
  latestDispatchAt?: string | null;
  latestDispatchTitle?: string | null;
};

export type AuthResponse = {
  access_token: string;
  expires_in: string;
  user: AuthUser;
};

export type UpdateProfileInput = {
  name?: string;
  avatarUrl?: string;
  country?: string;
  homeBase?: string;
  travelStyle?: string;
  bio?: string;
  profileVisibility?: ProfileVisibility;
};

function toLocalUser(
  user: AuthUser,
  overrides: Partial<LocalUser> = {},
): LocalUser {
  return {
    id: user.id,
    accountId: user.accountId,
    name: user.name || "LingTour Guest",
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
    ...overrides,
  };
}

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
  user: AuthUser,
  overrides: Partial<LocalUser> = {},
) {
  const localUser = toLocalUser(user, overrides);
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
  persistAuthUser(data.user);
  return data;
}

export async function refreshCurrentUserProfile() {
  const user = await apiGet<AuthUser>("/auth/me");
  return persistAuthUser(user);
}

export async function updateCurrentUserProfile(input: UpdateProfileInput) {
  const user = await apiPatch<AuthUser>("/auth/me", input);
  return persistAuthUser(user);
}
