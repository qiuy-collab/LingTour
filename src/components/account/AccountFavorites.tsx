"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FavoriteItem = {
  id: string;
  type: "route" | "product";
  title: string;
};

function readFavorites() {
  const stored = window.localStorage.getItem("lingtour-favorites");
  return stored ? (JSON.parse(stored) as FavoriteItem[]) : [];
}

export function AccountFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    return readFavorites();
  });

  useEffect(() => {
    function syncFavorites() {
      setFavorites(readFavorites());
    }

    window.addEventListener("storage", syncFavorites);
    window.addEventListener("lingtour-favorites", syncFavorites);

    return () => {
      window.removeEventListener("storage", syncFavorites);
      window.removeEventListener("lingtour-favorites", syncFavorites);
    };
  }, []);

  if (favorites.length === 0) {
    return (
      <div className="border border-[var(--line)] bg-[var(--paper)] p-8">
        <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">No favorites yet.</p>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          Save routes or cultural products, and they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {favorites.map((item) => (
        <Link
          key={`${item.type}-${item.id}`}
          href={item.type === "route" ? `/routes/${item.id}` : `/checkout?product=${item.id}`}
          className="group border border-[var(--line)] bg-[var(--paper)] p-6 transition hover:border-[var(--cinnabar)] hover:bg-white"
        >
          <p className="text-label text-[var(--cinnabar)]">{item.type === "route" ? "Saved route" : "Saved object"}</p>
          <h3 className="mt-4 font-[family:var(--font-display)] text-3xl leading-tight text-[var(--river-deep)]">
            {item.title}
          </h3>
          <p className="mt-5 text-sm font-semibold text-[var(--muted)] transition group-hover:translate-x-1">
            Open saved item
          </p>
        </Link>
      ))}
    </div>
  );
}
