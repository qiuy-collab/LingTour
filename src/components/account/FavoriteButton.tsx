"use client";

import { useEffect, useState } from "react";

type FavoriteButtonProps = {
  id: string;
  type: "route" | "product";
  title: string;
  variant?: "light" | "dark";
};

type FavoriteItem = {
  id: string;
  type: "route" | "product";
  title: string;
};

const storageKey = "lingtour-favorites";

function readFavorites() {
  if (typeof window === "undefined") {
    return [] as FavoriteItem[];
  }

  const stored = window.localStorage.getItem(storageKey);
  if (!stored) {
    return [] as FavoriteItem[];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [] as FavoriteItem[];
    }

    return parsed.filter(
      (item): item is FavoriteItem =>
        Boolean(item) &&
        typeof item.id === "string" &&
        (item.type === "route" || item.type === "product") &&
        typeof item.title === "string",
    );
  } catch {
    return [] as FavoriteItem[];
  }
}

export function FavoriteButton({ id, type, title, variant = "light" }: FavoriteButtonProps) {
  const [saved, setSaved] = useState(() => readFavorites().some((item) => item.id === id && item.type === type));
  const isDark = variant === "dark";

  useEffect(() => {
    function syncSaved() {
      setSaved(readFavorites().some((item) => item.id === id && item.type === type));
    }

    window.addEventListener("storage", syncSaved);
    window.addEventListener("lingtour-favorites", syncSaved);

    return () => {
      window.removeEventListener("storage", syncSaved);
      window.removeEventListener("lingtour-favorites", syncSaved);
    };
  }, [id, type]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      data-favorite-button="true"
      data-favorite-id={id}
      data-favorite-type={type}
      data-favorite-title={title}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
        isDark
          ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-[var(--night)]"
          : "border-[var(--line)] bg-white/82 text-[var(--ink)] hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
      }`}
    >
      <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"}>
        <path
          d="M12 20.5L10.8 19.4C6.6 15.6 4 13.2 4 10.2C4 7.8 5.9 6 8.3 6C9.6 6 10.9 6.6 11.7 7.6H12.3C13.1 6.6 14.4 6 15.7 6C18.1 6 20 7.8 20 10.2C20 13.2 17.4 15.6 13.2 19.4L12 20.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span data-favorite-label>{saved ? "Saved" : "Save"}</span>
    </button>
  );
}
