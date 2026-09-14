"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LocalUser, readStoredUser } from "@/lib/auth-client";
import { useLocale } from "@/lib/locale-context";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AccountNavLink({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useLocale();
  const [user, setUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    function syncUser() {
      setUser(readStoredUser());
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
      <Link
        href="/login?next=%2Fprofile%3Ftab%3Dnotes"
        onClick={onNavigate}
        className="btn-paper-compact ml-2 inline-flex min-h-11 items-center gap-2 text-sm"
        aria-label="Log in to open your traveler profile"
      >
        <span aria-hidden className="h-2 w-2 rotate-45 bg-[var(--cinnabar)]/85" />
        {t("common.nav.login")}
      </Link>
    );
  }

  return (
    <div className="ml-2" suppressHydrationWarning>
      <Link
        href="/profile?tab=notes"
        onClick={onNavigate}
        className="relative z-20 inline-flex min-h-11 items-center gap-3 border border-[var(--line)] bg-white/72 px-2 py-1.5 text-sm text-[var(--ink)] transition hover:border-[var(--cinnabar)] hover:bg-white"
        aria-label="Open your traveler profile"
      >
        <span className="grid h-8 w-8 place-items-center bg-[var(--cinnabar)] font-[family:var(--font-display)] text-sm text-white">
          {getInitials(user.name)}
        </span>
        <span className="hidden max-w-24 truncate lg:inline">{user.name}</span>
      </Link>
    </div>
  );
}
