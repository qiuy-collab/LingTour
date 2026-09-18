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

export type SessionAction = "login" | "register" | "google" | "email-code";

export type EmailCodePurpose = "login" | "signup";

export type EmailCodeResponse = {
  email: string;
  purpose: EmailCodePurpose;
  expiresInSeconds: number;
  delivery: "email" | "development";
  devCode?: string;
};

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
    const raw = window.localStorage.getItem("culvoy-user");
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("culvoy-user");
    void clearSession();
  } finally {
    window.dispatchEvent(new Event("culvoy-auth"));
  }
}

export function persistAuthUser(
  user: AuthUser,
  overrides: Partial<LocalUser> = {},
) {
  const localUser = toLocalUser(user, overrides);
  window.localStorage.setItem("culvoy-user", JSON.stringify(localUser));
  window.dispatchEvent(new Event("culvoy-auth"));
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

export function sendEmailCode(email: string, purpose: EmailCodePurpose = "login") {
  return apiPost<EmailCodeResponse>("/auth/email-code/send", { email, purpose });
}

/**
 * Forgot-password step 1. The API answers identically whether or not the
 * address exists, so the caller must never read success as "account found".
 */
export function requestPasswordReset(email: string) {
  return apiPost<{ email: string; expiresInSeconds: number }>(
    "/auth/password/forgot",
    { email },
  );
}

/** Forgot-password step 2: redeem the emailed code and set the new password. */
export function resetPasswordWithCode(input: {
  email: string;
  code: string;
  newPassword: string;
}) {
  return apiPost<{ ok: boolean }>("/auth/password/reset", input);
}

export async function verifyEmailCode(input: {
  email: string;
  code: string;
  purpose?: EmailCodePurpose;
  name?: string;
}) {
  const data = await createSession("email-code", {
    email: input.email,
    purpose: input.purpose ?? "login",
    code: input.code,
    name: input.name,
  });
  persistAuthUser(data.user);
  return data;
}

export async function refreshCurrentUserProfile() {
  const user = await apiGet<AuthUser>("/auth/me");
  return persistAuthUser(user);
}

/** Email change step 1: send a verification code to the NEW address. */
export function requestCurrentUserEmailChange(newEmail: string) {
  return apiPost<{ email: string; expiresInSeconds: number }>(
    "/auth/me/email/change-request",
    { newEmail },
  );
}

/**
 * Email change step 2: confirm with the code that was sent to the new
 * address, then refresh the local copy of the account.
 */
export async function confirmCurrentUserEmailChange(
  newEmail: string,
  code: string,
) {
  await apiPost<unknown>("/auth/me/email/confirm", { newEmail, code });
  return refreshCurrentUserProfile();
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
