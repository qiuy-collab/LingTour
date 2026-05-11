"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/ui-context";

type LocalUser = {
  name: string;
  email: string;
  country?: string;
  travelStyle?: string;
};

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
  const recentOrders: { slug: string; name: string; price: number; currency: string }[] = [];

  // Load data from localStorage on mount and when drawer opens
  const loadData = () => {
    if (typeof window === "undefined") return;
    setUser(readJSON<LocalUser | null>("lingtour-user", null));
    setFavorites(readJSON<FavoriteItem[]>("lingtour-favorites", []).filter(
      (item) => item && typeof item.id === "string" && typeof item.title === "string",
    ));
    setCart(readJSON<CartItem[]>("lingtour-cart", []));
    setRecentRoutes(readJSON<RecentRoute[]>("lingtour-recent-routes", []).slice(0, 3));
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
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-[var(--line)] bg-[var(--paper)] shadow-[0_0_100px_rgba(17,25,35,0.15)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--line)] px-6 py-5">
              <p className="font-[family:var(--font-display)] text-xl tracking-[0.06em] text-[var(--river-deep)]">
                Your LingTour
              </p>
              <button
                type="button"
                onClick={closeDrawer}
                className="grid h-8 w-8 place-items-center text-[var(--muted)] transition hover:text-[var(--ink)]"
                aria-label="Close drawer"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* User Profile Section */}
              {user ? (
                <section className="border-b border-[var(--line)] bg-[var(--paper-deep)] px-6 py-8">
                  <div className="flex items-center gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[var(--cinnabar)] font-[family:var(--font-display)] text-2xl text-white shadow-[0_12px_32px_rgba(182,66,53,0.3)]">
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-[family:var(--font-display)] text-2xl leading-none text-[var(--ink)]">
                        {user.name}
                      </p>
                      <p className="mt-2 truncate text-xs text-[var(--muted)]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  {user.travelStyle && (
                    <div className="mt-6 border-l border-[var(--line)] pl-4">
                      <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">Travel Style</p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
                        {user.travelStyle}
                      </p>
                    </div>
                  )}

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        logOut();
                        closeDrawer();
                      }}
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-red-100 bg-red-50 px-5 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Log out
                    </button>
                  </div>
                </section>
              ) : (
                <section className="border-b border-[var(--line)] bg-[var(--paper-deep)] px-6 py-8">
                  <p className="font-[family:var(--font-display)] text-2xl text-[var(--ink)]">
                    Planning your tour?
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                    Sign in to save routes, objects, and manage your interpreting requests.
                  </p>
                  <Link
                    href="/login"
                    onClick={closeDrawer}
                    className="mt-6 inline-flex h-11 items-center justify-center bg-[var(--cinnabar)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--cinnabar-deep)]"
                  >
                    Sign in
                  </Link>
                </section>
              )}

              {/* Booking Drafts */}
              {user && (
                <section className="border-b border-[var(--line)] px-6 py-5">
                  <p className="text-label text-[var(--cinnabar)]">Interpreting Drafts</p>
                  <div className="mt-4 grid gap-3">
                    {bookingDrafts.map((booking) => (
                      <Link
                        key={`${booking.city}-${booking.date}`}
                        href="/interpreting#booking"
                        onClick={closeDrawer}
                        className="block border border-[var(--line)] bg-white px-4 py-3 transition hover:border-[var(--cinnabar)]"
                      >
                        <p className="text-xs text-[var(--muted)]">{booking.status} • {booking.city}</p>
                        <p className="mt-1 text-sm font-medium text-[var(--ink)] truncate">{booking.service}</p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Favorites */}
              <section className="border-b border-[var(--line)] px-6 py-5">
                <p className="text-label text-[var(--cinnabar)]">Favorites</p>
                {favorites.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {favorites.map((item) => {
                      const href = item.type === "route"
                        ? `/routes/${item.id}`
                        : `/shop/products/${item.id}`;
                      return (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={href}
                          onClick={closeDrawer}
                          className="block border border-[var(--line)] bg-white px-4 py-3 transition hover:border-[var(--cinnabar)]"
                        >
                          <p className="text-xs text-[var(--muted)]">{item.type === "route" ? "Route" : "Product"}</p>
                          <p className="mt-1 text-sm font-medium text-[var(--ink)]">{item.title}</p>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--muted)]">Nothing saved yet. Browse routes or products and save what catches your eye.</p>
                )}
              </section>

              {/* Cart */}
              <section className="border-b border-[var(--line)] px-6 py-5">
                <p className="text-label text-[var(--cinnabar)]">Cart</p>
                {cart.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {cart.map((item) => (
                      <div
                        key={item.productSlug}
                        className="flex items-center gap-4 border border-[var(--line)] bg-white px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--ink)] truncate">{item.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-[var(--cinnabar)]">
                          {`SGD $${(item.price * item.quantity).toFixed(2)}`}
                        </p>
                      </div>
                    ))}
                    <Link
                      href="/checkout"
                      onClick={closeDrawer}
                      className="kinetic-link mt-1 bg-[var(--cinnabar)] px-4 py-3 text-center text-sm text-white transition hover:bg-[var(--cinnabar-deep)]"
                    >
                      Go to checkout
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--muted)]">Your cart is empty. Visit the store to find objects tied to Guangdong&apos;s stories.</p>
                )}
              </section>

              {/* Recent Orders */}
              {user && (
                <section className="border-b border-[var(--line)] px-6 py-5">
                  <p className="text-label text-[var(--cinnabar)]">Recent Orders</p>
                  <div className="mt-4 grid gap-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order.slug}
                        className="flex items-center gap-4 border border-[var(--line)] bg-white px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--ink)] truncate">{order.name}</p>
                          <p className="mt-0.5 text-xs text-[var(--muted)]">Processing</p>
                        </div>
                        <p className="text-sm font-medium text-[var(--ink)]">
                          {`${order.currency} $${order.price.toFixed(2)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Recent Routes */}
              <section className="px-6 py-5">
                <p className="text-label text-[var(--cinnabar)]">Recently viewed</p>
                {recentRoutes.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {recentRoutes.map((route) => (
                      <Link
                        key={route.slug}
                        href={`/routes/${route.slug}`}
                        onClick={closeDrawer}
                        className="block border border-[var(--line)] bg-white px-4 py-3 transition hover:border-[var(--cinnabar)]"
                      >
                        <p className="text-sm font-medium text-[var(--ink)]">{route.title}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--muted)]">Routes you visit will appear here for quick access.</p>
                )}
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
