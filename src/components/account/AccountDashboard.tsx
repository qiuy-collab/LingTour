"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { storyRoutes } from "@/data/routes";
import { formatStorePrice, storeProducts } from "@/data/store";

type LocalUser = {
  name: string;
  email: string;
  country?: string;
  travelStyle?: string;
};

type FavoriteItem = {
  id: string;
  type: "route" | "product";
  title: string;
};

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

const fallbackUser: LocalUser = {
  name: "Maya Chen",
  email: "guest@lingtour.cn",
  country: "Singapore",
  travelStyle: "Culture routes and food walks",
};

function readUser() {
  const stored = window.localStorage.getItem("lingtour-user");
  if (stored) {
    return JSON.parse(stored) as LocalUser;
  }

  const params = new URLSearchParams(window.location.search);
  const email = params.get("email");

  if (!email) {
    window.localStorage.setItem("lingtour-user", JSON.stringify(fallbackUser));
    return fallbackUser;
  }

  const userFromLogin: LocalUser = {
    name: params.get("name") || "Maya Chen",
    email,
    country: params.get("country") || "Singapore",
    travelStyle: params.get("travelStyle") || "Culture routes and food walks",
  };

  window.localStorage.setItem("lingtour-user", JSON.stringify(userFromLogin));
  window.history.replaceState(null, "", "/account");
  return userFromLogin;
}

function readFavorites() {
  const stored = window.localStorage.getItem("lingtour-favorites");
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is FavoriteItem =>
        Boolean(item) &&
        typeof item.id === "string" &&
        (item.type === "route" || item.type === "product") &&
        typeof item.title === "string",
    );
  } catch {
    return [];
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

export function AccountDashboard() {
  const [user, setUser] = useState<LocalUser | null>(fallbackUser);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const featuredRoutes = storyRoutes.slice(0, 3);
  const recentOrders = storeProducts.slice(0, 2);

  useEffect(() => {
    function syncAccount() {
      setUser(readUser() ?? fallbackUser);
      setFavorites(readFavorites());
    }

    syncAccount();
    window.addEventListener("storage", syncAccount);
    window.addEventListener("lingtour-auth", syncAccount);
    window.addEventListener("lingtour-favorites", syncAccount);

    return () => {
      window.removeEventListener("storage", syncAccount);
      window.removeEventListener("lingtour-auth", syncAccount);
      window.removeEventListener("lingtour-favorites", syncAccount);
    };
  }, []);

  const savedRoutes = useMemo(() => favorites.filter((item) => item.type === "route"), [favorites]);
  const savedProducts = useMemo(() => favorites.filter((item) => item.type === "product"), [favorites]);

  function logOut() {
    window.localStorage.removeItem("lingtour-user");
    window.dispatchEvent(new Event("lingtour-auth"));
    setUser(null);
  }

  if (!user) {
    return (
      <div>
        <section className="relative overflow-hidden bg-[var(--night)] text-white">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-28"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?auto=format&fit=crop&w=1800&q=82)",
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,25,35,0.98),rgba(17,25,35,0.76),rgba(17,25,35,0.44))]" />
          <div className="site-container relative grid min-h-[30rem] items-center py-16 lg:py-20">
            <div className="max-w-3xl">
              <p className="text-label text-white/52">Personal center</p>
              <h1 className="mt-5 max-w-[14ch] font-[family:var(--font-display)] text-5xl leading-[1.04] md:text-6xl">
                Sign in before opening your travel desk.
              </h1>
              <p className="mt-7 max-w-xl border-l border-white/18 pl-6 text-base leading-8 text-white/70">
                Your account keeps saved routes, cultural products, interpreting drafts, and profile
                details together for the next planning step.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="bg-[var(--cinnabar)] px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-[var(--cinnabar-deep)]">
                  Sign in
                </Link>
                <Link href="/culture" className="border border-white/20 px-6 py-4 text-center text-sm font-semibold text-white/82 transition hover:bg-white hover:text-[var(--night)]">
                  Continue browsing
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="site-container py-16 lg:py-20">
          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
            {["Save routes", "Track drafts", "Return faster"].map((title, index) => (
              <div key={title} className="bg-[var(--paper)] p-6">
                <p className="font-[family:var(--font-display)] text-4xl text-[var(--cinnabar)]">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="mt-6 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {index === 0
                    ? "Mark routes and products while browsing, then reopen them here."
                    : index === 1
                      ? "Keep interpreting request ideas visible before booking."
                      : "Use the header avatar or this page to continue planning."}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="bg-[var(--night)] text-white">
        <div className="site-container grid gap-10 py-16 lg:grid-cols-[0.72fr_1.08fr] lg:items-end lg:py-20">
          <div>
            <p className="text-label text-white/52">Personal center</p>
            <div className="mt-6 flex items-center gap-5">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[var(--cinnabar)] font-[family:var(--font-display)] text-3xl shadow-[0_20px_60px_rgba(182,66,53,0.34)]">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <h1 className="font-[family:var(--font-display)] text-5xl leading-none md:text-6xl">
                  {user.name}
                </h1>
                <p className="mt-3 truncate text-sm text-white/58">{user.email}</p>
              </div>
            </div>
            <p className="mt-8 max-w-xl border-l border-white/18 pl-6 text-base leading-8 text-white/70">
              {user.travelStyle ?? "Culture routes and food walks"} from {user.country ?? "your region"}.
              This desk keeps your next Guangdong decisions close.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden border border-white/12 bg-white/12 sm:grid-cols-4">
            {[
              ["Saved routes", String(savedRoutes.length)],
              ["Saved objects", String(savedProducts.length)],
              ["Drafts", String(bookingDrafts.length)],
              ["Orders", String(recentOrders.length)],
            ].map(([label, value]) => (
              <div key={label} className="bg-white/7 p-5">
                <p className="text-label text-white/42">{label}</p>
                <p className="mt-5 font-[family:var(--font-display)] text-4xl">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-14 lg:py-20">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Next actions</p>
            <h2 className="mt-4 max-w-[15ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              Move from saved interest to a real plan.
            </h2>
            <button
              type="button"
              className="mt-8 border border-[var(--line)] bg-white px-6 py-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]"
              onClick={logOut}
            >
              Log out
            </button>
          </div>

          <div className="grid gap-px overflow-hidden border border-[var(--line)] bg-[var(--line)] md:grid-cols-3">
            <Link href="/routes" className="bg-[var(--paper)] p-6 transition hover:bg-white">
              <p className="text-label text-[var(--cinnabar)]">Routes</p>
              <h3 className="mt-5 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                Choose a story route
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Open all route ideas and save the ones worth planning.</p>
            </Link>
            <Link href="/interpreting#booking" className="bg-[var(--paper)] p-6 transition hover:bg-white">
              <p className="text-label text-[var(--cinnabar)]">Interpreting</p>
              <h3 className="mt-5 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                Finish a request
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Send city, date, group size, and route interests.</p>
            </Link>
            <Link href="/shop/products" className="bg-[var(--paper)] p-6 transition hover:bg-white">
              <p className="text-label text-[var(--cinnabar)]">Store</p>
              <h3 className="mt-5 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                Browse cultural objects
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">Keep route memories connected to products.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[var(--paper-deep)] py-14 lg:py-20">
        <div className="site-container grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Booking drafts</p>
            <h2 className="mt-4 max-w-[16ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              Requests waiting for details.
            </h2>
          </div>
          <div className="grid gap-4">
            {bookingDrafts.map((booking) => (
              <article key={`${booking.city}-${booking.date}`} className="grid gap-4 border border-[var(--line)] bg-white p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-label text-[var(--muted)]">{booking.status}</p>
                  <h3 className="mt-3 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">
                    {booking.city} / {booking.service}
                  </h3>
                  <p className="mt-3 text-sm text-[var(--muted)]">Preferred date: {booking.date}</p>
                </div>
                <Link href="/interpreting#booking" className="border border-[var(--line)] px-5 py-3 text-center text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--cinnabar)] hover:text-[var(--cinnabar)]">
                  Edit request
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="site-container py-14 lg:py-20">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Favorites</p>
            <h2 className="mt-4 max-w-[16ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              Saved routes and objects.
            </h2>
          </div>
          <Link href="/routes" className="text-sm font-semibold text-[var(--cinnabar)]">
            Add more favorites
          </Link>
        </div>

        <div data-account-favorites-empty className="grid gap-6 border border-[var(--line)] bg-[var(--paper)] p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">No favorites yet.</p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Save routes or cultural products from detail pages, then return here to compare them.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/routes" className="bg-[var(--river-deep)] px-5 py-3 text-center text-sm text-white">
              Browse routes
            </Link>
            <Link href="/shop/products" className="border border-[var(--line)] bg-white px-5 py-3 text-center text-sm">
              Browse objects
            </Link>
          </div>
        </div>
        <div data-account-favorites-list hidden className="grid gap-4 md:grid-cols-2" />
      </section>

      <section className="site-container pb-16 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-label text-[var(--cinnabar)]">Recent paths</p>
            <h2 className="mt-4 max-w-[16ch] font-[family:var(--font-display)] text-4xl leading-[1.12] text-[var(--river-deep)] md:text-[2.85rem]">
              Useful places to continue.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {featuredRoutes.map((route) => (
              <Link key={route.slug} href={`/routes/${route.slug}`} className="group relative min-h-[21rem] overflow-hidden bg-[var(--night)] text-white">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-76 transition duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${route.image})` }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,25,35,0.1),rgba(17,25,35,0.86))]" />
                <div className="relative z-10 flex min-h-[21rem] flex-col justify-end p-5">
                  <p className="text-label text-white/58">{route.culture}</p>
                  <h3 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight">{route.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--night)] py-14 text-white lg:py-20">
        <div className="site-container grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-label text-white/48">Store activity</p>
            <h2 className="mt-4 max-w-[16ch] font-[family:var(--font-display)] text-4xl leading-[1.12] md:text-[2.85rem]">
              Recent cultural object orders.
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden bg-white/12">
            {recentOrders.map((order) => (
              <article key={order.slug} className="grid gap-5 bg-white/6 p-5 md:grid-cols-[6rem_1fr_auto] md:items-center">
                <div
                  className="h-24 bg-cover bg-center"
                  style={{ backgroundImage: `url(${order.image})` }}
                />
                <div>
                  <p className="text-label text-white/48">{order.tag}</p>
                  <h3 className="mt-2 font-[family:var(--font-display)] text-2xl">{order.name}</h3>
                  <p className="mt-2 text-sm text-white/60">{formatStorePrice(order)} / Processing</p>
                </div>
                <Link href={`/checkout?product=${order.slug}`} className="border border-white/18 px-5 py-3 text-center text-sm font-semibold text-white/78 transition hover:bg-white hover:text-[var(--night)]">
                  View
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
