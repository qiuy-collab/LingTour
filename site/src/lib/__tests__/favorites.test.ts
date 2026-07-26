import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  hydrateFavoritesFromServer,
  readFavorites,
  writeFavorites,
} from "../favorites";

const TOKEN_KEY = "lingtour-token";

function serverReturns(items: unknown[]) {
  return vi.fn(async (url: string, init?: RequestInit) => {
    if (String(url).endsWith("/auth/me/favorites") && (!init || !init.method || init.method === "GET")) {
      return { ok: true, json: async () => ({ items }) } as Response;
    }
    return { ok: true, json: async () => ({}) } as Response;
  });
}

describe("favorites store", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("leaves the local list alone when nobody is signed in", async () => {
    writeFavorites([{ id: "a", type: "route", title: "A" }]);
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const result = await hydrateFavoritesFromServer();

    expect(result).toHaveLength(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("merges the account's items with the ones saved in this browser", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    writeFavorites([{ id: "local-only", type: "product", title: "Local" }]);
    vi.stubGlobal(
      "fetch",
      serverReturns([
        { targetType: "route", targetId: "from-server", targetTitle: "Server" },
      ]),
    );

    const result = await hydrateFavoritesFromServer();

    expect(result.map((r) => r.id).sort()).toEqual(["from-server", "local-only"]);
    expect(readFavorites()).toHaveLength(2);
  });

  it("does not duplicate an item both sides already have", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    writeFavorites([{ id: "shared", type: "city", title: "Shared" }]);
    vi.stubGlobal(
      "fetch",
      serverReturns([
        { targetType: "city", targetId: "shared", targetTitle: "Shared" },
      ]),
    );

    const result = await hydrateFavoritesFromServer();

    expect(result).toHaveLength(1);
  });

  it("pushes browser-only items up so both sides converge", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    writeFavorites([{ id: "local-only", type: "product", title: "Local" }]);
    const fetchSpy = serverReturns([]);
    vi.stubGlobal("fetch", fetchSpy);

    await hydrateFavoritesFromServer();

    const posts = fetchSpy.mock.calls.filter((c) => c[1]?.method === "POST");
    expect(posts).toHaveLength(1);
    expect(JSON.parse(String(posts[0][1]?.body))).toMatchObject({
      targetType: "product",
      targetId: "local-only",
    });
  });

  it("keeps the local list when the account cannot be reached", async () => {
    localStorage.setItem(TOKEN_KEY, "t");
    writeFavorites([{ id: "a", type: "route", title: "A" }]);
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));

    const result = await hydrateFavoritesFromServer();

    expect(result).toEqual([{ id: "a", type: "route", title: "A" }]);
  });
});
