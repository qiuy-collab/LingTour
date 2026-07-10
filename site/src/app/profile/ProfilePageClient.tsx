"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Price } from "@/components/ui/Price";
import {
  readStoredUser,
  refreshCurrentUserProfile,
  updateCurrentUserProfile,
  uploadCurrentUserAvatar,
  type LocalUser,
  type ProfileVisibility,
} from "@/lib/auth-client";
import { readCart, type CartItem } from "@/lib/cart";
import {
  fetchSavedCommunityPosts,
  fetchTravelerInterpretingBookings,
  type CommunityFeedPost,
  type TravelerInterpretingBooking,
} from "@/lib/api-data";
import { countryName, countryOptions, normalizeCountryCode } from "@/lib/country-list";
import { useLocale } from "@/lib/locale-context";

type ProfileTab = "notes" | "routes" | "collection" | "bookings" | "settings";
type FavoriteItem = { id: string; type: string; title: string };

const PROFILE_TABS: Array<{ key: ProfileTab; labelKey: string }> = [
  { key: "notes", labelKey: "account.profile.tabs.notes" },
  { key: "routes", labelKey: "account.profile.tabs.routes" },
  { key: "collection", labelKey: "account.profile.tabs.collection" },
  { key: "bookings", labelKey: "account.profile.tabs.bookings" },
  { key: "settings", labelKey: "account.profile.tabs.settings" },
];

function readFavorites(): FavoriteItem[] {
  try {
    const raw = window.localStorage.getItem("lingtour-favorites");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.id === "string" && typeof item.title === "string")
      : [];
  } catch {
    return [];
  }
}

function favoriteHref(item: FavoriteItem) {
  if (item.type === "route") return `/routes/${item.id}`;
  if (item.type === "city" || item.type === "culture") return `/culture/${item.id}`;
  if (item.type === "product") return `/shop/products/${item.id}`;
  return "/routes";
}

function profileCompletion(user: LocalUser) {
  const values = [user.avatarUrl, user.country, user.homeBase, user.travelStyle, user.bio];
  return Math.round((values.filter((value) => Boolean(value?.trim())).length / values.length) * 100);
}

function formatBookingDate(value: string, locale: string) {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

function EmptyArchive({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="mx-auto max-w-2xl border border-dashed border-[var(--line)] bg-white/38 px-6 py-14 text-center sm:px-10">
      <span className="mx-auto block h-px w-12 bg-[var(--gold)]" />
      <h2 className="mt-6 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">{title}</h2>
      <p className="handwritten mx-auto mt-4 max-w-lg text-base leading-relaxed text-[var(--muted)]">{body}</p>
      <Link href={href} className="btn-primary mt-8 inline-flex px-7 py-4 text-xs">
        {cta}
      </Link>
    </div>
  );
}

export function ProfilePageClient() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab") as ProfileTab | null;
  const activeTab = PROFILE_TABS.some((tab) => tab.key === requestedTab) ? requestedTab! : "notes";
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [ready, setReady] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [savedNotes, setSavedNotes] = useState<CommunityFeedPost[]>([]);
  const [bookings, setBookings] = useState<TravelerInterpretingBooking[]>([]);
  const [bookingsReady, setBookingsReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    country: "",
    homeBase: "",
    travelStyle: "",
    bio: "",
    profileVisibility: "public" as ProfileVisibility,
  });
  const countries = useMemo(() => countryOptions(locale), [locale]);
  const savedRoutes = favorites.filter((item) => item.type !== "product");
  const savedProducts = favorites.filter((item) => item.type === "product");
  const savedCollectionItems: CartItem[] = savedProducts.map((item) => ({
    slug: item.id,
    name: item.title,
    quantity: 1,
    price: 0,
    currency: "CNY",
    selected: false,
  }));
  const collectionItems = Array.from(
    new Map<string, CartItem>(
      [...cart, ...savedCollectionItems].map((item) => [item.slug, item]),
    ).values(),
  );

  function hydrateProfile(nextUser: LocalUser | null) {
    setUser(nextUser);
    if (!nextUser) return;
    setForm({
      name: nextUser.name || "",
      country: normalizeCountryCode(nextUser.country),
      homeBase: nextUser.homeBase || "",
      travelStyle: nextUser.travelStyle || "",
      bio: nextUser.bio || "",
      profileVisibility: nextUser.profileVisibility || "public",
    });
  }

  useEffect(() => {
    hydrateProfile(readStoredUser());
    setFavorites(readFavorites());
    setCart(readCart());
    setReady(true);

    const hasToken = Boolean(window.localStorage.getItem("lingtour-token"));
    if (!hasToken) return;

    let cancelled = false;
    void Promise.allSettled([
      refreshCurrentUserProfile(),
      fetchSavedCommunityPosts(locale, 24),
      fetchTravelerInterpretingBookings(),
    ]).then(([profileResult, notesResult, bookingsResult]) => {
      if (cancelled) return;
      if (profileResult.status === "fulfilled") hydrateProfile(profileResult.value);
      if (notesResult.status === "fulfilled") setSavedNotes(notesResult.value);
      if (bookingsResult.status === "fulfilled") setBookings(bookingsResult.value);
      setBookingsReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  function selectTab(tab: ProfileTab) {
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  }

  async function saveProfile() {
    if (!form.name.trim()) {
      setMessage(t("account.profile.nameRequired"));
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const nextUser = await updateCurrentUserProfile({
        name: form.name.trim(),
        country: form.country,
        homeBase: form.homeBase.trim(),
        travelStyle: form.travelStyle.trim(),
        bio: form.bio.trim(),
        profileVisibility: form.profileVisibility,
      });
      hydrateProfile(nextUser);
      setMessage(t("account.profile.saved"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("account.profile.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function uploadAvatar(file?: File) {
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      await uploadCurrentUserAvatar(file);
      hydrateProfile(readStoredUser());
      setMessage(t("account.profile.avatarSaved"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("account.profile.avatarFailed"));
    } finally {
      setUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  if (!ready) return <div className="min-h-[60vh] bg-[var(--paper-deep)]" />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--paper-deep)] bg-grain py-20">
        <EmptyArchive
          title={t("account.profile.signInTitle")}
          body={t("account.profile.signInBody")}
          href="/login"
          cta={t("account.profile.signInCta")}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper-deep)] bg-grain pb-28 text-[var(--river-deep)] sm:pb-20">
      <header className="border-b border-[var(--line)] py-12 sm:py-16 lg:py-20">
        <div className="site-container flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <button type="button" onClick={() => avatarInputRef.current?.click()} className="group relative w-fit" aria-label={t("account.profile.changeAvatar")}>
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                seed={user.accountId}
                size={116}
                ringClassName="ring-4 ring-white scrapbook-shadow"
              />
              <span className="absolute -bottom-2 -right-3 bg-[var(--cinnabar)] px-3 py-2 text-[8px] font-bold uppercase tracking-[0.16em] text-white transition-transform group-hover:-translate-y-1">
                {uploading ? t("account.profile.uploading") : t("account.profile.editPhoto")}
              </span>
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void uploadAvatar(event.target.files?.[0])} />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--cinnabar)]">
                {t("account.profile.passportLabel")}
              </p>
              <h1 className="mt-3 font-[family:var(--font-display)] text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92] tracking-[-0.04em]">
                {user.name}
              </h1>
              <p className="handwritten mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
                {user.bio || t("account.profile.bioFallback")}
              </p>
            </div>
          </div>
          <div className="border-t border-[var(--line)] pt-5 text-sm text-[var(--muted)] md:w-56 md:border-t-0 md:border-l md:pl-6 md:pt-0">
            <p>{countryName(user.country, locale) || t("account.profile.locationUnset")}</p>
            <p className="mt-2">{user.homeBase || user.email}</p>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
              {t("account.profile.completion").replace("{number}", String(profileCompletion(user)))}
            </p>
          </div>
        </div>
      </header>

      <div className="sticky top-[4.55rem] z-30 border-b border-[var(--line)] bg-[var(--paper-deep)]/95 backdrop-blur-sm">
        <nav className="site-container flex gap-7 overflow-x-auto" aria-label={t("account.profile.tabLabel")}>
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => selectTab(tab.key)}
              className={`relative shrink-0 py-5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                activeTab === tab.key ? "text-[var(--cinnabar)]" : "text-[var(--muted)] hover:text-[var(--river-deep)]"
              }`}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {t(tab.labelKey)}
              {activeTab === tab.key ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--cinnabar)]" /> : null}
            </button>
          ))}
        </nav>
      </div>

      <main className="site-container py-10 sm:py-14 lg:py-20">
        {activeTab === "notes" ? (
          savedNotes.length ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {savedNotes.map((note, index) => (
                <Link key={note.id} href={`/community?post=${note.id}`} className={`group block ${index % 2 ? "sm:translate-y-8" : ""}`}>
                  {note.image ? <img src={note.image} alt="" className="aspect-[4/3] w-full border-[0.55rem] border-white object-cover scrapbook-shadow" /> : null}
                  <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{note.channel}</p>
                  <h2 className="mt-2 font-[family:var(--font-display)] text-2xl leading-tight transition-colors group-hover:text-[var(--cinnabar)]">{note.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">{note.excerpt}</p>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyArchive title={t("account.profile.notesEmpty")} body={t("account.profile.notesEmptyBody")} href="/community" cta={t("account.profile.notesCta")} />
          )
        ) : null}

        {activeTab === "routes" ? (
          savedRoutes.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedRoutes.map((item) => (
                <Link key={`${item.type}-${item.id}`} href={favoriteHref(item)} className="group border-y border-[var(--line)] py-6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">{item.type}</p>
                  <h2 className="mt-3 font-[family:var(--font-display)] text-2xl transition-colors group-hover:text-[var(--cinnabar)]">{item.title}</h2>
                  <span className="mt-6 inline-flex text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--cinnabar)]">{t("account.profile.openRecord")} →</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyArchive title={t("account.profile.routesEmpty")} body={t("account.profile.routesEmptyBody")} href="/routes" cta={t("account.profile.routesCta")} />
          )
        ) : null}

        {activeTab === "collection" ? (
          collectionItems.length ? (
            <div className="grid gap-10 lg:grid-cols-2">
              {collectionItems.map((item, index) => (
                <Link key={`${item.slug}-${index}`} href={`/shop/products/${item.slug}`} className="group flex gap-5 border-b border-[var(--line)] pb-6">
                  {"image" in item && item.image ? <img src={item.image} alt="" className="h-24 w-24 shrink-0 border-4 border-white object-cover" /> : <div className="h-24 w-24 shrink-0 border border-dashed border-[var(--line)] bg-white/45" />}
                  <div className="min-w-0">
                    <h2 className="font-[family:var(--font-display)] text-2xl transition-colors group-hover:text-[var(--cinnabar)]">{item.name}</h2>
                    <p className="mt-2 text-sm text-[var(--muted)]">{t("account.profile.quantity")} {item.quantity}</p>
                    {item.price > 0 ? <p className="mt-3 text-sm text-[var(--gold)]"><Price amount={item.price * item.quantity} currency={item.currency} /></p> : null}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyArchive title={t("account.profile.collectionEmpty")} body={t("account.profile.collectionEmptyBody")} href="/shop" cta={t("account.profile.collectionCta")} />
          )
        ) : null}

        {activeTab === "bookings" ? (
          !bookingsReady ? (
            <p className="py-14 text-center text-sm text-[var(--muted)]" role="status">
              {t("account.profile.bookingsLoading")}
            </p>
          ) : bookings.length ? (
            <section aria-label={t("account.profile.bookingsLabel")}>
              <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] lg:grid-cols-2">
                {bookings.map((booking) => (
                  <article key={booking.id} className="bg-[var(--paper)] p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
                          {t(`account.profile.bookingStatus.${booking.status}`)}
                        </p>
                        <h2 className="mt-3 font-[family:var(--font-display)] text-3xl leading-none text-[var(--river-deep)]">
                          {booking.city}
                        </h2>
                      </div>
                      <time className="text-xs text-[var(--muted)]" dateTime={booking.serviceDate}>
                        {formatBookingDate(booking.serviceDate, locale)}
                      </time>
                    </div>
                    <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{t("account.profile.bookingMode")}</dt>
                        <dd className="mt-2 text-[var(--ink)]">{booking.supportMode}</dd>
                      </div>
                      <div>
                        <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{t("account.profile.bookingGroup")}</dt>
                        <dd className="mt-2 text-[var(--ink)]">{booking.groupSize || t("account.profile.bookingPending")}</dd>
                      </div>
                      {booking.assignedInterpreterName ? (
                        <div className="sm:col-span-2">
                          <dt className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{t("account.profile.bookingInterpreter")}</dt>
                          <dd className="mt-2 text-[var(--ink)]">{booking.assignedInterpreterName}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {booking.routeOrNeed ? <p className="mt-5 border-t border-[var(--line)] pt-5 text-sm leading-6 text-[var(--muted)]">{booking.routeOrNeed}</p> : null}
                  </article>
                ))}
              </div>
              <Link href="/interpreting#interpreting-booking" className="btn-primary mt-8 inline-flex px-7 py-4 text-xs">
                {t("account.profile.bookingsCta")}
              </Link>
            </section>
          ) : (
            <EmptyArchive title={t("account.profile.bookingsEmpty")} body={t("account.profile.bookingsEmptyBody")} href="/interpreting#interpreting-booking" cta={t("account.profile.bookingsCta")} />
          )
        ) : null}

        {activeTab === "settings" ? (
          <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
            <div className="space-y-7">
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("account.profile.name")}</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 text-lg outline-none focus:border-[var(--cinnabar)]" />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("account.profile.country")}</span>
                <select value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 outline-none focus:border-[var(--cinnabar)]">
                  <option value="">{t("account.profile.countryPlaceholder")}</option>
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.label}</option>)}
                </select>
              </label>
              <div className="grid gap-7 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("account.profile.homeBase")}</span>
                  <input value={form.homeBase} onChange={(event) => setForm((current) => ({ ...current, homeBase: event.target.value }))} className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 outline-none focus:border-[var(--cinnabar)]" />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("account.profile.travelStyle")}</span>
                  <input value={form.travelStyle} onChange={(event) => setForm((current) => ({ ...current, travelStyle: event.target.value }))} className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 outline-none focus:border-[var(--cinnabar)]" />
                </label>
              </div>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("account.profile.bio")}</span>
                <textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} rows={5} className="mt-2 w-full resize-y border border-[var(--line)] bg-white/45 p-4 leading-relaxed outline-none focus:border-[var(--cinnabar)]" />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">{t("account.profile.visibility")}</span>
                <select value={form.profileVisibility} onChange={(event) => setForm((current) => ({ ...current, profileVisibility: event.target.value as ProfileVisibility }))} className="mt-2 w-full border-b border-[var(--line)] bg-transparent py-3 outline-none focus:border-[var(--cinnabar)]">
                  <option value="public">{t("account.profile.visibilityPublic")}</option>
                  <option value="community">{t("account.profile.visibilityCommunity")}</option>
                  <option value="private">{t("account.profile.visibilityPrivate")}</option>
                </select>
              </label>
              {message ? <p className="text-sm text-[var(--cinnabar)]" role="status">{message}</p> : null}
              <button type="button" onClick={() => void saveProfile()} disabled={saving} className="btn-primary inline-flex px-8 py-4 text-xs disabled:opacity-50">
                {saving ? t("account.profile.saving") : t("account.profile.save")}
              </button>
            </div>
            <aside className="border-t border-[var(--line)] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="font-[family:var(--font-display)] text-2xl italic">{t("account.profile.settingsNoteTitle")}</p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{t("account.profile.settingsNoteBody")}</p>
              <p className="mt-7 text-xs text-[var(--muted)]">{user.email}</p>
            </aside>
          </section>
        ) : null}
      </main>

      {activeTab !== "settings" ? (
        <button type="button" onClick={() => selectTab("settings")} className="btn-primary fixed bottom-4 left-4 right-4 z-40 py-4 text-xs shadow-[0_6px_8px_rgba(17,25,35,0.18)] sm:hidden">
          {t("account.profile.edit")}
        </button>
      ) : null}
    </div>
  );
}
