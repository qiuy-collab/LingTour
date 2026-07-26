"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FAVORITES_EVENT,
  pushFavorite,
  readFavorites,
  writeFavorites,
  type FavoriteType,
} from "@/lib/favorites";

type FavoriteButtonProps = {
  id: string;
  type: FavoriteType;
  title: string;
  image?: string;
  variant?: "light" | "dark";
};

export function FavoriteButton({ id, type, title, image, variant = "light" }: FavoriteButtonProps) {
  const [saved, setSaved] = useState(false);
  const isDark = variant === "dark";

  useEffect(() => {
    function syncSaved() {
      setSaved(readFavorites().some((item) => item.id === id && item.type === type));
    }

    syncSaved();
    window.addEventListener("storage", syncSaved);
    window.addEventListener(FAVORITES_EVENT, syncSaved);

    return () => {
      window.removeEventListener("storage", syncSaved);
      window.removeEventListener(FAVORITES_EVENT, syncSaved);
    };
  }, [id, type]);

  const handleClick = useCallback(() => {
    const favorites = readFavorites();
    const exists = favorites.some((item) => item.id === id && item.type === type);
    const next = exists
      ? favorites.filter((item) => !(item.id === id && item.type === type))
      : [...favorites, { id, type, title, image }];
    writeFavorites(next);

    // Signed-out visitors keep a local-only list; the account merges on sign-in.
    void pushFavorite(exists ? "remove" : "add", { id, type, title, image });
  }, [id, type, title, image]);

  return (
    <button
      type="button"
      aria-pressed={saved}
      data-favorite-button="true"
      data-react-favorite="true"
      data-favorite-id={id}
      data-favorite-type={type}
      data-favorite-title={title}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 ${
        isDark
          ? "btn-ghost-dark"
          : "border-[var(--line)] bg-white/82 text-[var(--ink)] hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
      }`}
      onClick={handleClick}
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
      <span data-favorite-label className="hidden sm:inline">
        {saved ? "Saved" : "Save"}
      </span>
    </button>
  );
}
