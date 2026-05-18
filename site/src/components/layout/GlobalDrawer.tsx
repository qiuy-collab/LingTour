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
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-lg flex-col border-l border-white/20 bg-[rgba(242,238,230,0.4)] backdrop-blur-3xl shadow-[0_0_100px_rgba(17,25,35,0.1)]"
          >
            {/* Background Light Leak Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(185,138,70,0.08),transparent_70%)] blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[radial-gradient(circle,rgba(182,66,53,0.05),transparent_70%)] blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-10 py-10 bg-transparent relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--river-deep)]">
                    Registry_01
                  </p>
                </div>
                <h2 className="font-[family:var(--font-display)] text-5xl italic tracking-[-0.02em] text-[var(--river-deep)]">
                  Personal Vault
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="group relative h-14 w-14 rounded-full border border-[var(--river-deep)]/10 flex items-center justify-center transition-all hover:border-[var(--river-deep)]"
                aria-label="Close drawer"
              >
                <div className="absolute inset-0 rounded-full bg-[var(--river-deep)] scale-0 group-hover:scale-100 transition-transform duration-500 origin-center" />
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="relative z-10 group-hover:text-white transition-colors">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-10 py-4 space-y-16 relative z-10 scrollbar-hide">
              {/* User Profile Section */}
              {user ? (
                <section className="relative">
                  <div className="flex flex-col gap-10">
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-white p-1.5 shadow-2xl rotate-2 group transition-transform hover:rotate-0 duration-500">
                          <div className="h-full w-full rounded-xl overflow-hidden bg-[var(--river-deep)] flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="font-[family:var(--font-display)] text-4xl text-white">{getInitials(user.name)}</span>
                            )}
                          </div>
                        </div>
                        {/* Light flare on avatar */}
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-white blur-2xl opacity-60 pointer-events-none" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-[family:var(--font-display)] text-5xl leading-none text-[var(--river-deep)]">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="h-px w-6 bg-[var(--gold)]" />
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
                            {user.country || "Explorer"} / Joined {user.memberSince || "2026"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Community Rank - Glass Card */}
                    <Link
                      href="/community"
                      onClick={closeDrawer}
                      className="group relative overflow-hidden rounded-3xl bg-white/40 border border-white/60 p-8 shadow-2xl transition-all hover:bg-white/60"
                    >
                      {/* Dynamic light gradient on hover */}
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.4),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                      <div className="flex justify-between items-start relative z-10">
                        <div className="space-y-6">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--river-deep)] text-white shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.74z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)]">Field Status</p>
                            <p className="font-[family:var(--font-display)] text-3xl italic text-[var(--river-deep)] mt-1">{stamps >= 10 ? "Route Master" : stamps >= 5 ? "Pathfinder" : "Fresh Recruit"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-[var(--gold)]/10 text-[var(--gold)] px-4 py-2 rounded-full text-[10px] font-bold tracking-widest border border-[var(--gold)]/20">
                            STAMPS: {stamps}
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          logOut();
                          closeDrawer();
                        }}
                        className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--muted)] hover:text-[var(--cinnabar)] transition-colors"
                      >
                        [ Terminate Session ]
                      </button>
                      <div className="flex gap-4">
                        <div className="w-1 h-1 rounded-full bg-[var(--gold)]" />
                        <div className="w-1 h-1 rounded-full bg-[var(--gold)]/40" />
                        <div className="w-1 h-1 rounded-full bg-[var(--gold)]/20" />
                      </div>
                    </div>
                  </div>
                </section>
              ) : (
                <section className="relative rounded-3xl bg-white/30 border border-white/50 p-10 shadow-2xl overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.4),transparent)] pointer-events-none" />
                  <p className="font-[family:var(--font-display)] text-4xl italic text-[var(--river-deep)] leading-tight">
                    Establish your <br /> field registry.
                  </p>
                  <p className="mt-6 text-sm leading-relaxed text-[var(--muted)] font-light max-w-[25ch]">
                    Synchronize routes, artifacts, and coordination requests across the province.
                  </p>
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className="group mt-10 relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--river-deep)] text-[10px] font-bold uppercase tracking-[0.3em] text-white transition-all shadow-2xl active:scale-95"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <span>Initiate Connection</span>
                  </Link>
                </section>
              )}

              {/* Data Layers */}
              <section className="space-y-12">
                <div className="flex items-center gap-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--river-deep)] opacity-30">Field_Intel</p>
                  <div className="h-px flex-1 bg-[var(--river-deep)]/10" />
                </div>

                <div className="space-y-16">
                  {/* Favorites */}
                  <div className="space-y-8">
                    <div className="flex items-end justify-between">
                      <h4 className="font-[family:var(--font-display)] text-4xl italic text-[var(--river-deep)]">Signals</h4>
                      <span className="text-[9px] font-bold text-[var(--gold)] tracking-[0.2em] border-b border-[var(--gold)]/30 pb-1">{favorites.length} TOTAL</span>
                    </div>
                    {favorites.length > 0 ? (
                      <div className="grid gap-6">
                        {favorites.map((item) => {
                          const href = item.type === "route" ? `/routes/${item.id}` : `/shop/products/${item.id}`;
                          return (
                            <Link
                              key={`${item.type}-${item.id}`}
                              href={href}
                              onClick={closeDrawer}
                              className="group flex items-center gap-6 p-4 rounded-2xl border border-transparent hover:border-white/40 hover:bg-white/20 transition-all"
                            >
                              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                                {item.type === "route" ? (
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M9 20l-5-2V4l5 2m0 14l5-2m-5 2v-14m5 12l5 2V6l-5-2m0 14V4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                ) : (
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-[var(--gold)]">{item.type}</p>
                                <p className="mt-1 truncate text-lg font-bold text-[var(--river-deep)]">{item.title}</p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--muted)] italic opacity-40">Listening for active signals...</p>
                    )}
                  </div>

                  {/* Cart */}
                  <div className="space-y-8">
                    <div className="flex items-end justify-between">
                      <h4 className="font-[family:var(--font-display)] text-4xl italic text-[var(--river-deep)]">Objects</h4>
                      <span className="text-[9px] font-bold text-[var(--gold)] tracking-[0.2em] border-b border-[var(--gold)]/30 pb-1">{cart.length} ACQUIRED</span>
                    </div>
                    {cart.length > 0 ? (
                      <div className="space-y-10">
                        <div className="grid gap-6">
                          {cart.map((item) => (
                            <div key={item.productSlug} className="flex items-center gap-6 group">
                              <div className="h-20 w-20 shrink-0 rounded-2xl bg-white p-2 shadow-xl -rotate-2 group-hover:rotate-0 transition-transform">
                                {item.image && <img src={item.image} alt="" className="h-full w-full object-cover rounded-lg" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-lg font-bold text-[var(--river-deep)]">{item.name}</p>
                                <p className="mt-1 text-[9px] font-bold text-[var(--gold)] uppercase tracking-widest">UNIT_QTY: {item.quantity}</p>
                              </div>
                              <p className="font-[family:var(--font-display)] text-xl text-[var(--cinnabar)]">
                                ${(item.price * item.quantity).toFixed(0)}
                              </p>
                            </div>
                          ))}
                        </div>
                        <Link
                          href="/checkout"
                          onClick={closeDrawer}
                          className="group relative flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-[var(--river-deep)] text-[10px] font-bold uppercase tracking-[0.3em] text-white shadow-2xl"
                        >
                          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <span>Finalize Collection</span>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--muted)] italic opacity-40">Field bag remains empty.</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Logs */}
              {user && (
                <section className="space-y-8 pb-10">
                  <div className="flex items-center gap-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-[var(--river-deep)] opacity-30">Dispatch_Logs</p>
                    <div className="h-px flex-1 bg-[var(--river-deep)]/10" />
                  </div>

                  <div className="grid gap-6">
                    {bookingDrafts.map((booking) => (
                      <Link
                        key={`${booking.city}-${booking.date}`}
                        href="/interpreting#booking"
                        onClick={closeDrawer}
                        className="group relative block rounded-3xl bg-white/20 border border-white/40 p-6 transition-all hover:bg-white/40"
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="bg-[var(--gold)]/10 text-[var(--gold)] px-3 py-1 rounded-md text-[8px] font-bold tracking-[0.2em]">{booking.status.toUpperCase()}</div>
                          <p className="text-[10px] font-mono text-[var(--muted)] opacity-60">{booking.date}</p>
                        </div>
                        <p className="font-[family:var(--font-display)] text-2xl text-[var(--river-deep)]">{booking.city} Coordination</p>
                        <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                          <span className="w-4 h-px bg-[var(--line)]" />
                          {booking.service}
                        </div>
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

