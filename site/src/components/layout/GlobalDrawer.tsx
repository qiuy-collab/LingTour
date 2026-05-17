"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/ui-context";
import { LocalUser, readStoredUser, signInWithGoogle } from "@/lib/auth-client";

type FavoriteItem = { id: string; type: string; title: string };
type CartItem = { productSlug: string; name: string; quantity: number; price: number; image?: string };
type RecentRoute = { slug: string; title: string };

const bookingDrafts = [
  {
    city: "Foshan",
    date: "2026-06-18",
    service: "Story route guided support",
    status: "Draft",
  },
  {
    city: "Shantou",
    date: "2026-07-04",
    service: "City companion interpreting",
    status: "Need quote",
  },
];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : fallback;
    return parsed;
  } catch {
    return fallback;
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
    window.localStorage.removeItem("lingtour-token");
  } catch {
    // localStorage may be unavailable
  }
  window.dispatchEvent(new Event("lingtour-auth"));
}

export function GlobalDrawer() {
  const { isDrawerOpen, closeDrawer } = useUI();
  const pathname = usePathname();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([]);
  const [stamps, setStamps] = useState(0);
  const recentOrders: { slug: string; name: string; price: number; currency: string }[] = [];

  async function connectGoogleAccount() {
    const existing = readStoredUser();
    await signInWithGoogle({
      email: existing?.email || "google@lingtour.local",
      name: existing?.name || "Google Traveler",
    });
  }

  // Load data from localStorage on mount and when drawer opens
  const loadData = () => {
    if (typeof window === "undefined") return;
    setUser(readStoredUser());
    setFavorites(readJSON<FavoriteItem[]>("lingtour-favorites", []).filter(
      (item) => item && typeof item.id === "string" && typeof item.title === "string",
    ));
    setCart(readJSON<CartItem[]>("lingtour-cart", []));
    setRecentRoutes(readJSON<RecentRoute[]>("lingtour-recent-routes", []).slice(0, 3));
    setStamps(Number(window.localStorage.getItem("lingtour-community-stamps") || "0"));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    window.addEventListener("lingtour-favorites", loadData);
    window.addEventListener("lingtour-auth", loadData);
    return () => {
      window.removeEventListener("lingtour-favorites", loadData);
      window.removeEventListener("lingtour-auth", loadData);
    };
  }, []);

  // Reload when drawer opens
  useEffect(() => {
    if (isDrawerOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadData();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Auto-close on route change
  useEffect(() => {
    closeDrawer();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] backdrop-blur-xl bg-[rgba(242,238,230,0.8)]"
            onClick={closeDrawer}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-[var(--line)] bg-[var(--paper-deep)] bg-grain shadow-[0_0_100px_rgba(17,25,35,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--line)] px-8 py-6 bg-white/40 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-[var(--gold)] animate-pulse" />
                <p className="font-[family:var(--font-display)] text-2xl italic tracking-[0.02em] text-[var(--river-deep)]">
                  Your LingTour
                </p>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="group grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] transition-all hover:border-[var(--cinnabar)] hover:bg-[var(--cinnabar)] hover:text-white"
                aria-label="Close drawer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-12">
              {/* User Profile Section */}
              {user ? (
                <section className="relative">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[var(--river-deep)] font-[family:var(--font-display)] text-3xl text-white scrapbook-shadow overflow-hidden">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : getInitials(user.name)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[var(--gold)] border-2 border-[var(--paper-deep)]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-[family:var(--font-display)] text-3xl italic leading-none text-[var(--river-deep)]">
                          {user.name}
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                          <span className="inline-block w-3 h-px bg-[var(--line)]" />
                          {user.country || "Explorer"} / Joined {user.memberSince || "2026"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="scrapbook-shadow border border-[var(--line)] bg-white/60 p-4 rotate-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)]">Traveler ID</p>
                        <p className="mt-1 font-mono text-xs text-[var(--river-deep)]">{user.accountId}</p>
                      </div>
                      <div className="scrapbook-shadow border border-[var(--line)] bg-white/60 p-4 -rotate-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)]">Travel Style</p>
                        <p className="mt-1 text-xs font-bold text-[var(--river-deep)]">{user.travelStyle || "Curious Local"}</p>
                      </div>
                    </div>

                    {/* Community Stats Badge */}
                    <Link
                      href="/community"
                      onClick={closeDrawer}
                      className="group flex items-center justify-between border border-[var(--line)] bg-[var(--river-deep)] p-4 text-white shadow-xl transition-all hover:bg-[var(--cinnabar)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Community Rank</p>
                          <p className="font-[family:var(--font-display)] text-lg italic">{stamps >= 10 ? "Route Master" : stamps >= 5 ? "Pathfinder" : "Fresh Recruit"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-white/60">Stamps</p>
                        <p className="text-xl font-bold">{stamps}</p>
                      </div>
                    </Link>
                  </div>

                  <div className="mt-8 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        logOut();
                        closeDrawer();
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-[var(--cinnabar)] transition-colors underline underline-offset-4 decoration-[var(--line)]"
                    >
                      Sign Out Account
                    </button>
                    <div className="h-px flex-1 bg-[var(--line)]" />
                  </div>
                </section>
              ) : (
                <section className="relative scrapbook-shadow border-4 border-white bg-white/40 p-8 rotate-1">
                  <p className="font-[family:var(--font-display)] text-3xl italic text-[var(--river-deep)]">
                    Planning your tour?
                  </p>
                  <p className="handwritten mt-4 text-sm leading-relaxed text-[var(--muted)]">
                    Sign in to save routes, objects, and manage your interpreting requests in this personal registry.
                  </p>
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className="mt-8 inline-flex h-12 w-full items-center justify-center bg-[var(--river-deep)] text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-[var(--cinnabar)] active:scale-95"
                  >
                    Log in with email
                  </Link>
                </section>
              )}

              {/* Favorites & Cart Tabs (New Concept) */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-[var(--line)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">Registry & Kit</p>
                  <div className="h-px flex-1 bg-[var(--line)]" />
                </div>

                <div className="space-y-12">
                  {/* Favorites */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-[family:var(--font-display)] text-xl italic text-[var(--river-deep)]">Saved Signals</h4>
                      <span className="text-[10px] font-bold text-[var(--muted)]">{favorites.length} Items</span>
                    </div>
                    {favorites.length > 0 ? (
                      <div className="grid gap-4">
                        {favorites.map((item, idx) => {
                          const href = item.type === "route"
                            ? `/routes/${item.id}`
                            : `/shop/products/${item.id}`;
                          return (
                            <Link
                              key={`${item.type}-${item.id}`}
                              href={href}
                              onClick={closeDrawer}
                              className={`group relative flex items-center gap-4 border border-[var(--line)] bg-white p-3 scrapbook-shadow transition-all hover:-translate-y-1 ${idx % 2 === 0 ? "rotate-1" : "-rotate-1"}`}
                            >
                              <div className="grid h-10 w-10 shrink-0 place-items-center bg-[var(--paper-deep)] text-[var(--gold)]">
                                {item.type === "route" ? (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 20l-5-2V4l5 2m0 14l5-2m-5 2v-14m5 12l5 2V6l-5-2m0 14V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                ) : (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">{item.type}</p>
                                <p className="mt-0.5 truncate text-sm font-bold text-[var(--river-deep)] group-hover:text-[var(--cinnabar)]">{item.title}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="handwritten text-sm text-[var(--muted)] opacity-60">Your private collection is currently empty...</p>
                    )}
                  </div>

                  {/* Cart */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-[family:var(--font-display)] text-xl italic text-[var(--river-deep)]">Field Objects</h4>
                      <span className="text-[10px] font-bold text-[var(--muted)]">{cart.length} in Cart</span>
                    </div>
                    {cart.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid gap-3">
                          {cart.map((item) => (
                            <div
                              key={item.productSlug}
                              className="flex items-center gap-4 border-b border-[var(--line)] pb-4"
                            >
                              <div className="h-14 w-14 shrink-0 bg-white p-1 scrapbook-shadow -rotate-2">
                                {item.image && <img src={item.image} alt="" className="h-full w-full object-cover" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-[var(--river-deep)]">{item.name}</p>
                                <p className="mt-1 text-[10px] font-bold text-[var(--gold)] uppercase tracking-widest">Qty: {item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-[var(--cinnabar)]">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                        <Link
                          href="/checkout"
                          onClick={closeDrawer}
                          className="btn-primary mt-4 flex w-full items-center justify-center py-4"
                        >
                          Checkout Bag
                        </Link>
                      </div>
                    ) : (
                      <p className="handwritten text-sm text-[var(--muted)] opacity-60">No objects collected from the store yet.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Interpreter Requests */}
              {user && (
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-[var(--line)]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--cinnabar)]">Dispatch Logs</p>
                    <div className="h-px flex-1 bg-[var(--line)]" />
                  </div>

                  <div className="grid gap-4">
                    {bookingDrafts.map((booking, idx) => (
                      <Link
                        key={`${booking.city}-${booking.date}`}
                        href="/interpreting#booking"
                        onClick={closeDrawer}
                        className={`group relative block border border-dashed border-[var(--line)] bg-white/30 p-5 transition-all hover:bg-white ${idx % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
                      >
                        <div className="absolute -left-2 top-1/2 h-8 w-1 -translate-y-1/2 bg-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--gold)]">{booking.status}</p>
                          <p className="text-[9px] font-mono text-[var(--muted)]">{booking.date}</p>
                        </div>
                        <p className="font-[family:var(--font-display)] text-lg text-[var(--river-deep)]">{booking.city} Dispatch</p>
                        <p className="mt-1 handwritten text-xs text-[var(--muted)]">{booking.service}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

