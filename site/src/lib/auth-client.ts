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

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("lingtour-user");
    window.localStorage.removeItem("lingtour-token");
  } finally {
    window.dispatchEvent(new Event("lingtour-auth"));
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

export async function signInWithGoogle(credential: string, name?: string) {
  const data = await apiPost<AuthResponse>("/auth/google", {
    credential,
    name: name || "Google Traveler",
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

export async function uploadCurrentUserAvatar(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const result = await apiPost<{ url: string }>("/auth/me/avatar", form);
  // The endpoint already persisted avatarUrl server-side. Refresh local copy
  // so the rest of the UI sees the new value immediately.
  await refreshCurrentUserProfile();
  return result.url;
}
