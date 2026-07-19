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

const PROFILE_FIELD_CLASS =
  "mt-2 min-h-12 w-full rounded-[var(--radius-sm)] border border-[var(--line)] bg-white/68 px-4 py-3 text-[var(--river-deep)] outline-none transition focus:border-[var(--river-deep)] focus:shadow-[0_0_0_3px_rgba(20,52,61,0.08)]";

const PROFILE_LABEL_CLASS =
  "font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]";

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
    <div className="mx-auto max-w-2xl rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] px-6 py-14 text-center shadow-[0_18px_62px_rgba(17,25,35,0.07)] sm:px-10">
      <span className="mx-auto block h-px w-12 bg-[var(--gold)]" />
      <h2 className="mt-6 font-[family:var(--font-display)] text-3xl text-[var(--river-deep)]">{title}</h2>
      <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-[var(--muted)]">{body}</p>
      <Link href={href} className="lt-action lt-action-primary mt-8">
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
  const tabRefs = useRef<Partial<Record<ProfileTab, HTMLButtonElement | null>>>({});
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

  useEffect(() => {
    if (!ready) return;
    tabRefs.current[activeTab]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeTab, ready]);

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
      <header className="border-b border-white/10 bg-[var(--night)] py-10 text-white sm:py-12 lg:py-16">
        <div className="site-container flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <button type="button" onClick={() => avatarInputRef.current?.click()} className="group relative w-fit" aria-label={t("account.profile.changeAvatar")}>
              <Avatar
                src={user.avatarUrl}
                name={user.name}
                seed={user.accountId}
                size={116}
                ringClassName="ring-4 ring-white/16 shadow-[0_18px_52px_rgba(0,0,0,0.24)]"
              />
              <span className="absolute -bottom-2 -right-3 rounded-full bg-[var(--gold)] px-3 py-2 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-[var(--night)] transition-transform group-hover:-translate-y-1">
                {uploading ? t("account.profile.uploading") : t("account.profile.editPhoto")}
              </span>
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void uploadAvatar(event.target.files?.[0])} />
            <div>
              <p className="font-mono text-[8px] font-bold uppercase tracking-[0.24em] text-[var(--gold)]">
                {t("account.profile.passportLabel")}
              </p>
              <h1 className="mt-3 font-[family:var(--font-display)] text-[clamp(2.8rem,7vw,5.5rem)] leading-[0.92] tracking-[-0.04em]">
                {user.name}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/58 sm:text-lg">
                {user.bio || t("account.profile.bioFallback")}
              </p>
            </div>
          </div>
          <div className="rounded-[var(--radius-md)] border border-white/12 bg-white/[0.05] p-5 text-sm text-white/52 md:w-64">
            <p>{countryName(user.country, locale) || t("account.profile.locationUnset")}</p>
            <p className="mt-2">{user.homeBase || user.email}</p>
            <p className="mt-4 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">
              {t("account.profile.completion").replace("{number}", String(profileCompletion(user)))}
            </p>
          </div>
        </div>
      </header>

      <div className="sticky top-[4.5rem] z-30 border-b border-[var(--line)] bg-[var(--paper-deep)]/94 backdrop-blur-xl">
        <nav className="site-container scrollbar-hide flex gap-2 overflow-x-auto py-3" aria-label={t("account.profile.tabLabel")}>
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.key}
              ref={(node) => {
                tabRefs.current[tab.key] = node;
              }}
              type="button"
              onClick={() => selectTab(tab.key)}
              className={`min-h-10 shrink-0 rounded-full border px-4 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.16em] transition ${
                activeTab === tab.key
                  ? "border-[var(--river-deep)] bg-[var(--river-deep)] text-white"
                  : "border-[var(--line)] bg-white/58 text-[var(--muted)] hover:border-[var(--river-deep)] hover:text-[var(--river-deep)]"
              }`}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </nav>
      </div>

      <main className="site-container py-10 sm:py-14 lg:py-20">
        {activeTab === "notes" ? (
          savedNotes.length ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {savedNotes.map((note) => (
                <Link key={note.id} href={`/community?post=${note.id}`} className="group block overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[0_16px_52px_rgba(17,25,35,0.06)] transition hover:-translate-y-1">
                  {note.image ? <img src={note.image} alt="" className="aspect-[4/3] w-full object-cover" /> : null}
                  <div className="p-5">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{note.channel}</p>
                  <h2 className="mt-3 font-[family:var(--font-display)] text-2xl leading-tight transition-colors group-hover:text-[var(--cinnabar)]">{note.title}</h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--muted)]">{note.excerpt}</p>
                  </div>
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
                <Link key={`${item.type}-${item.id}`} href={favoriteHref(item)} className="group rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_14px_46px_rgba(17,25,35,0.05)] transition hover:-translate-y-1">
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
                <Link key={`${item.slug}-${index}`} href={`/shop/products/${item.slug}`} className="group flex gap-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_14px_46px_rgba(17,25,35,0.05)] transition hover:-translate-y-1">
                  {"image" in item && item.image ? <img src={item.image} alt="" className="h-24 w-24 shrink-0 rounded-[var(--radius-sm)] object-cover" /> : <div className="h-24 w-24 shrink-0 rounded-[var(--radius-sm)] border border-dashed border-[var(--line)] bg-white/45" />}
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
              <div className="grid gap-4 lg:grid-cols-2">
                {bookings.map((booking) => (
                  <article key={booking.id} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-strong)] p-6 shadow-[0_14px_46px_rgba(17,25,35,0.05)] sm:p-8">
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
              <Link href="/interpreting#interpreting-booking" className="lt-action lt-action-primary mt-8">
                {t("account.profile.bookingsCta")}
              </Link>
            </section>
          ) : (
            <EmptyArchive title={t("account.profile.bookingsEmpty")} body={t("account.profile.bookingsEmptyBody")} href="/interpreting#interpreting-booking" cta={t("account.profile.bookingsCta")} />
          )
        ) : null}

        {activeTab === "settings" ? (
          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
            <div className="grid gap-5 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_16px_52px_rgba(17,25,35,0.06)] sm:p-7">
              <label className="block">
                <span className={PROFILE_LABEL_CLASS}>{t("account.profile.name")}</span>
                <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={`${PROFILE_FIELD_CLASS} text-lg`} />
              </label>
              <label className="block">
                <span className={PROFILE_LABEL_CLASS}>{t("account.profile.country")}</span>
                <select value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} className={PROFILE_FIELD_CLASS}>
                  <option value="">{t("account.profile.countryPlaceholder")}</option>
                  {countries.map((country) => <option key={country.code} value={country.code}>{country.label}</option>)}
                </select>
              </label>
              <div className="grid gap-7 sm:grid-cols-2">
                <label className="block">
                  <span className={PROFILE_LABEL_CLASS}>{t("account.profile.homeBase")}</span>
                  <input value={form.homeBase} onChange={(event) => setForm((current) => ({ ...current, homeBase: event.target.value }))} className={PROFILE_FIELD_CLASS} />
                </label>
                <label className="block">
                  <span className={PROFILE_LABEL_CLASS}>{t("account.profile.travelStyle")}</span>
                  <input value={form.travelStyle} onChange={(event) => setForm((current) => ({ ...current, travelStyle: event.target.value }))} className={PROFILE_FIELD_CLASS} />
                </label>
              </div>
              <label className="block">
                <span className={PROFILE_LABEL_CLASS}>{t("account.profile.bio")}</span>
                <textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} rows={5} className={`${PROFILE_FIELD_CLASS} min-h-32 resize-y leading-relaxed`} />
              </label>
              <label className="block">
                <span className={PROFILE_LABEL_CLASS}>{t("account.profile.visibility")}</span>
                <select value={form.profileVisibility} onChange={(event) => setForm((current) => ({ ...current, profileVisibility: event.target.value as ProfileVisibility }))} className={PROFILE_FIELD_CLASS}>
                  <option value="public">{t("account.profile.visibilityPublic")}</option>
                  <option value="community">{t("account.profile.visibilityCommunity")}</option>
                  <option value="private">{t("account.profile.visibilityPrivate")}</option>
                </select>
              </label>
              {message ? <p className="text-sm text-[var(--cinnabar)]" role="status">{message}</p> : null}
              <button type="button" onClick={() => void saveProfile()} disabled={saving} className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--river-deep)] px-8 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:bg-[var(--cinnabar)] disabled:opacity-50">
                {saving ? t("account.profile.saving") : t("account.profile.save")}
              </button>
            </div>
            <aside className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/46 p-6">
              <p className="font-[family:var(--font-display)] text-2xl italic">{t("account.profile.settingsNoteTitle")}</p>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{t("account.profile.settingsNoteBody")}</p>
              <p className="mt-7 text-xs text-[var(--muted)]">{user.email}</p>
            </aside>
          </section>
        ) : null}
      </main>

      {activeTab !== "settings" ? (
        <button type="button" onClick={() => selectTab("settings")} className="fixed bottom-4 left-4 right-4 z-40 min-h-12 rounded-full bg-[var(--river-deep)] px-6 py-3 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_14px_38px_rgba(17,25,35,0.24)] sm:hidden">
          {t("account.profile.edit")}
        </button>
      ) : null}
    </div>
  );
}
