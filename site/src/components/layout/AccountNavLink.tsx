"use client";

import { useEffect, useState } from "react";
import { useUI } from "@/lib/ui-context";

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

export function AccountNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const { openDrawer } = useUI();

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
      <button
        type="button"
        onClick={() => {
          openDrawer();
          onNavigate?.();
        }}
        className="ml-2 grid h-9 w-9 place-items-center border border-[var(--line)] bg-white/60 transition hover:bg-white"
        aria-label="Open your travel desk"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--ink)]">
          <circle cx="6" cy="6" r="1.5" fill="currentColor" />
          <circle cx="12" cy="6" r="1.5" fill="currentColor" />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" />
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="18" cy="12" r="1.5" fill="currentColor" />
          <circle cx="6" cy="18" r="1.5" fill="currentColor" />
          <circle cx="12" cy="18" r="1.5" fill="currentColor" />
          <circle cx="18" cy="18" r="1.5" fill="currentColor" />
        </svg>
      </button>
    );
  }

  return (
    <div className="ml-2" suppressHydrationWarning>
      <button
        type="button"
        onClick={() => {
          openDrawer();
          onNavigate?.();
        }}
        className="relative z-20 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-2 py-1.5 text-sm text-[var(--ink)] shadow-[0_14px_40px_rgba(17,25,35,0.06)] transition hover:border-[var(--cinnabar)] hover:bg-white"
        aria-label="Open your travel desk"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--cinnabar)] font-[family:var(--font-display)] text-sm text-white shadow-[0_8px_22px_rgba(182,66,53,0.26)]">
          {getInitials(user.name)}
        </span>
        <span className="hidden max-w-24 truncate lg:inline">{user.name}</span>
      </button>
    </div>
  );
}
