"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LocalUser = {
  name: string;
  email: string;
  country?: string;
  travelStyle?: string;
};

function getStoredUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem("lingtour-user");
    return stored ? (JSON.parse(stored) as LocalUser) : null;
  } catch {
    return null;
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function logOut() {
  try {
    window.localStorage.removeItem("lingtour-user");
  } catch {
    // localStorage may be unavailable
  }
  window.dispatchEvent(new Event("lingtour-auth"));
}

export function AccountNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    function syncUser() {
      setUser(getStoredUser());
    }

    syncUser();
    window.addEventListener("storage", syncUser);
    window.addEventListener("lingtour-auth", syncUser);
    window.addEventListener("pageshow", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("lingtour-auth", syncUser);
      window.removeEventListener("pageshow", syncUser);
    };
  }, []);

  if (!user) {
    return (
      <div className="ml-2">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-4 py-1.5 text-sm text-[var(--ink)] shadow-[0_14px_40px_rgba(17,25,35,0.06)] transition hover:border-[var(--cinnabar)] hover:bg-white"
          aria-label="Sign in"
          onClick={onNavigate}
        >
          <span className="text-sm font-medium">Sign in</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="group relative ml-2" suppressHydrationWarning>
      <Link
        href="/account"
        className="relative z-20 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-2 py-1.5 text-sm text-[var(--ink)] shadow-[0_14px_40px_rgba(17,25,35,0.06)] transition hover:border-[var(--cinnabar)] hover:bg-white"
        aria-label="Open personal center"
        onClick={onNavigate}
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--cinnabar)] font-[family:var(--font-display)] text-sm text-white shadow-[0_8px_22px_rgba(182,66,53,0.26)]">
          {getInitials(user.name)}
        </span>
        <span className="hidden max-w-24 truncate lg:inline">{user.name}</span>
      </Link>

      <div className="pointer-events-none absolute right-0 top-full z-30 pt-2 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="min-w-56 overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-[0_20px_60px_rgba(17,25,35,0.15)]">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="text-sm font-semibold text-[var(--ink)]">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-[var(--muted)]">{user.email}</p>
          </div>
          <div className="p-2">
            <Link
              href="/account"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--ink)] transition hover:bg-[var(--paper-deep)]"
              onClick={onNavigate}
            >
              <svg className="h-4 w-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your travel desk
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-[var(--cinnabar)] transition hover:bg-red-50"
              onClick={() => {
                logOut();
                onNavigate?.();
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
