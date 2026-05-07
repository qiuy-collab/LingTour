"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LocalUser = {
  name: string;
  email: string;
  country?: string;
  travelStyle?: string;
};

const fallbackUser: LocalUser = {
  name: "Maya Chen",
  email: "guest@lingtour.cn",
  country: "Singapore",
  travelStyle: "Culture routes and food walks",
};

function readUser() {
  if (typeof window === "undefined") {
    return fallbackUser;
  }

  const stored = window.localStorage.getItem("lingtour-user");
  if (stored) {
    return JSON.parse(stored) as LocalUser;
  }

  window.localStorage.setItem("lingtour-user", JSON.stringify(fallbackUser));
  return fallbackUser;
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
  const [user, setUser] = useState<LocalUser>(() => readUser());

  useEffect(() => {
    function syncUser() {
      setUser(readUser());
    }

    window.addEventListener("storage", syncUser);
    window.addEventListener("lingtour-auth", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("lingtour-auth", syncUser);
    };
  }, []);

  return (
    <Link
      href="/account"
      className="ml-2 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/72 px-2 py-1.5 text-sm text-[var(--ink)] shadow-[0_14px_40px_rgba(17,25,35,0.06)] transition hover:border-[var(--cinnabar)] hover:bg-white"
      aria-label="Open personal center"
      onClick={onNavigate}
    >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--cinnabar)] font-[family:var(--font-display)] text-sm text-white shadow-[0_8px_22px_rgba(182,66,53,0.26)]">
          {getInitials(user.name)}
        </span>
        <span className="hidden max-w-24 truncate lg:inline">{user.name}</span>
    </Link>
  );
}
