"use client";

import { apiGet, apiPatch, apiPost, ApiRequestError } from "@/lib/api-client";

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
  access_token?: string;
  expires_in?: string;
  user: AuthUser;
};

export type UpdateProfileInput = {
  name?: string;
  email?: string;
  avatarUrl?: string;
  country?: string;
  homeBase?: string;
  travelStyle?: string;
  bio?: string;
  profileVisibility?: ProfileVisibility;
};

export type SessionAction = "login" | "register" | "google";

async function createSession<TPayload extends object>(action: SessionAction, payload: TPayload): Promise<AuthResponse> {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ action, payload }),
  });

  const data = await response.json().catch(() => ({ message: response.statusText }));
  if (!response.ok) {
    throw new ApiRequestError({ statusCode: response.status, message: String(data?.message || response.statusText) });
  }

  return data as AuthResponse;
}

export async function clearSession() {
  await fetch("/api/auth/session", { method: "DELETE", credentials: "same-origin" });
}

export function toLocalUser(
  user: AuthUser,
  overrides: Partial<LocalUser> = {},
): LocalUser {
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
    void clearSession();
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

export async function signInWithPassword(email: string, password: string) {
  const data = await createSession("login", { email, password });
  persistAuthUser(data.user);
  return data;
}

export async function registerWithPassword(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const data = await createSession("register", payload);
  persistAuthUser(data.user);
  return data;
}

export async function signInWithGoogle(credential: string, name?: string) {
  const data = await createSession("google", {
    credential,
    name: name || "Google Traveler",
  });

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
