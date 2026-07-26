"use client";

/**
 * Saved-items store.
 *
 * localStorage keeps the list readable offline and for signed-out visitors,
 * but it is not the record of truth for a signed-in traveller: the account
 * owns that. On sign-in the two are merged, so favourites survive clearing a
 * browser or moving to another device.
 */

export type FavoriteType = "route" | "product" | "city";

export type FavoriteItem = {
  id: string;
  type: FavoriteType;
  title: string;
  image?: string;
};

type ServerFavorite = {
  targetType: FavoriteType;
  targetId: string;
  targetTitle?: string;
  targetImage?: string;
};

const STORAGE_KEY = "lingtour-favorites";
const TOKEN_KEY = "lingtour-token";
export const FAVORITES_EVENT = "lingtour-favorites";

function apiBase() {
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
}

function token(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function readFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFavorites(items: FavoriteItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(FAVORITES_EVENT));
  } catch {
    // localStorage unavailable (private mode, quota); the in-memory list stands
  }
}

const sameItem = (a: { id: string; type: string }, b: { id: string; type: string }) =>
  a.id === b.id && a.type === b.type;

export async function pushFavorite(
  action: "add" | "remove",
  item: FavoriteItem,
): Promise<boolean> {
  const auth = token();
  if (!auth) return false;

  try {
    const res =
      action === "add"
        ? await fetch(`${apiBase()}/auth/me/favorites`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth}`,
            },
            body: JSON.stringify({
              targetType: item.type,
              targetId: item.id,
              targetTitle: item.title || "",
              targetImage: item.image || "",
            }),
          })
        : await fetch(
            `${apiBase()}/auth/me/favorites/${item.type}/${item.id}`,
            { method: "DELETE", headers: { Authorization: `Bearer ${auth}` } },
          );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Merge the account's saved items with whatever this browser holds.
 *
 * Union rather than replace: anything saved before signing in would otherwise
 * be lost, and anything saved on another device would never appear here.
 * Items that exist only locally are pushed up so both sides converge.
 */
export async function hydrateFavoritesFromServer(): Promise<FavoriteItem[]> {
  const auth = token();
  const local = readFavorites();
  if (!auth) return local;

  let remote: FavoriteItem[];
  try {
    const res = await fetch(`${apiBase()}/auth/me/favorites`, {
      headers: { Authorization: `Bearer ${auth}` },
    });
    if (!res.ok) return local;
    const body = (await res.json()) as { items?: ServerFavorite[] };
    remote = (body.items ?? []).map((item) => ({
      id: item.targetId,
      type: item.targetType,
      title: item.targetTitle || "",
      image: item.targetImage || undefined,
    }));
  } catch {
    return local;
  }

  const merged = [...remote];
  const localOnly: FavoriteItem[] = [];
  for (const item of local) {
    if (!merged.some((m) => sameItem(m, item))) {
      merged.push(item);
      localOnly.push(item);
    }
  }

  writeFavorites(merged);
  await Promise.allSettled(localOnly.map((item) => pushFavorite("add", item)));
  return merged;
}
