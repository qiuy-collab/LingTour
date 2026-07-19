"use client";

import { useEffect, useMemo, useState } from "react";
import { AUTH_PROMPTS } from "@/lib/auth-prompts";
import {
  createCommunityFeedPost,
  fetchCommunityFeed,
  fetchCommunityReactionSummary,
  fetchCommunityBriefs,
  type CommunityFeedPost,
  type FieldBrief,
} from "@/lib/api-data";
import {
  mergeCommunityPosts,
  readSyncedCommunityPosts,
  subscribeSyncedCommunityPosts,
  writeSyncedCommunityPosts,
} from "@/lib/community-sync";
import { useApiQuery } from "@/lib/use-api-query";
import { PostCard } from "@/components/community/PostCard";
import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import { BriefCard } from "@/components/community/BriefCard";
import { DispatchCard } from "@/components/community/DispatchCard";
import { Reveal } from "@/components/ui/Reveal";
import { FieldKit } from "@/components/community/FieldKit";
import { useLocale } from "@/lib/locale-context";
import { LocalUser, readStoredUser, signInWithGoogle } from "@/lib/auth-client";
import { getGoogleIdentityApi, requestGoogleCredential } from "@/lib/google-identity";

const channels = [
  "All",
  "Field Notes",
  "Food Map",
  "Hidden Stop",
  "Culture Desk",
] as const;
type Channel = (typeof channels)[number];
type PostChannel = Exclude<Channel, "All">;
type SortMode = "Live" | "Loved" | "Saved";

const CHANNEL_I18N: Record<Channel, string> = {
  All: "community.channel.all",
  "Field Notes": "community.channel.fieldNotes",
  "Food Map": "community.channel.foodMap",
  "Hidden Stop": "community.channel.hiddenStop",
  "Culture Desk": "community.channel.cultureDesk",
};

type Draft = {
  title: string;
  note: string;
  location: string;
  route: string;
  mood: string;
  channel: PostChannel;
  image?: string;
};

const LOCAL_STAMPS_KEY = "lingtour-community-stamps";

/**
 * Coerce a backend brief.channel (free-form string) to our typed `PostChannel`.
 * Falls back to "Field Notes" when the value isn't one of the known channels,
 * so a stale or misspelled brief doesn't break the page.
 */
function coerceChannel(channel: string): PostChannel {
  const allowed: readonly PostChannel[] = [
    "Field Notes",
    "Food Map",
    "Hidden Stop",
    "Culture Desk",
  ];
  return (allowed as readonly string[]).includes(channel)
    ? (channel as PostChannel)
    : "Field Notes";
}

function readLoginState() {
  if (typeof window === "undefined") return false;
  return Boolean(
    window.localStorage.getItem("lingtour-user") ||
    window.localStorage.getItem("lingtour-token"),
  );
}

function readUser(): LocalUser | null {
  return readStoredUser();
}

function sortPosts(posts: CommunityFeedPost[], sortMode: SortMode) {
  return [...posts].sort((a, b) => {
    if (sortMode === "Loved") return b.likes - a.likes;
    if (sortMode === "Saved") return b.saves - a.saves;
    return 0;
  });
}

/**
 * A neutral default draft used when no brief is selected (e.g. the API hasn't
 * returned briefs yet, or the editorial team hasn't published any).
 */
const NEUTRAL_DRAFT: Draft = {
  title: "",
  note: "",
  location: "",
  route: "",
  mood: "",
  channel: "Field Notes",
};

const draftFromBrief = (brief: FieldBrief | null): Draft => ({
  title: "",
  note: "",
  location: brief?.location ?? "",
  route: brief?.route ?? "",
  mood: brief?.mood ?? "",
  channel: brief ? coerceChannel(brief.channel) : "Field Notes",
});

export default function CommunityPage() {
  const { locale, t } = useLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [optimisticPosts, setOptimisticPosts] = useState<CommunityFeedPost[]>(
    [],
  );
  const [engagementOverrides, setEngagementOverrides] = useState<
    Record<string, Partial<Pick<CommunityFeedPost, "liked" | "likes" | "saved" | "saves">>>
  >({});
  const [activeChannel, setActiveChannel] = useState<Channel>("All");
  const [sortMode, setSortMode] = useState<SortMode>("Live");
  const [query, setQuery] = useState("");
  const [selectedBrief, setSelectedBrief] = useState<FieldBrief | null>(null);
  const [draft, setDraft] = useState<Draft>(() => NEUTRAL_DRAFT);
  const [toast, setToast] = useState<string | null>(null);
  const [stampCount, setStampCount] = useState(0);
  const [isKitOpen, setIsKitOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityFeedPost | null>(
    null,
  );

  const {
    data: remotePosts,
    loading,
    error,
    refetch,
  } = useApiQuery(() => fetchCommunityFeed(locale, { limit: 50 }), [locale]);

  // Editorial briefs: independent fetch, won't block the main feed render.
  const { data: briefs } = useApiQuery(
    () => fetchCommunityBriefs(locale),
    [locale],
  );
  const fieldBriefs = useMemo(() => briefs ?? [], [briefs]);

  // When briefs arrive (and nothing has been selected yet), default to the first.
  useEffect(() => {
    if (!selectedBrief && fieldBriefs.length > 0) {
      const first = fieldBriefs[0];
      setSelectedBrief(first);
      setDraft((prev) => ({
        ...prev,
        location: first.location,
        route: first.route,
        mood: first.mood,
        channel: coerceChannel(first.channel),
      }));
    }
  }, [fieldBriefs, selectedBrief]);

  const syncAuth = () => {
    setIsLoggedIn(readLoginState());
    setUser(readUser());
  };

  useEffect(() => {
    syncAuth();
    setOptimisticPosts(readSyncedCommunityPosts());
    const storedStamps = Number(
      window.localStorage.getItem(LOCAL_STAMPS_KEY) || "0",
    );
    setStampCount(Number.isFinite(storedStamps) ? storedStamps : 0);
    window.addEventListener("lingtour-auth", syncAuth);
    const unsubscribe = subscribeSyncedCommunityPosts(setOptimisticPosts);
    return () => {
      window.removeEventListener("lingtour-auth", syncAuth);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const route = searchParams.get("route");
    const location = searchParams.get("location");
    const note = searchParams.get("note");
    const title = searchParams.get("title");
    const channel = searchParams.get("channel") as PostChannel | null;
    const compose = searchParams.get("compose");

    if (!route && !location && !note && !title && !channel && compose !== "1")
      return;

    setDraft((current) => ({
      ...current,
      route: route || current.route,
      location: location || current.location,
      title: title || current.title,
      note: note || current.note,
      channel:
        channel && channels.includes(channel as Channel)
          ? channel
          : current.channel,
    }));

    if (channel && channels.includes(channel as Channel)) {
      setActiveChannel(channel);
    }

    if (compose === "1") {
      if (!readLoginState()) {
        setToast(AUTH_PROMPTS.connectGoogleToPublish);
        return;
      }
      setIsKitOpen(true);
    }
  }, []);

  const basePosts = useMemo(() => {
    return mergeCommunityPosts([...optimisticPosts, ...(remotePosts ?? [])]);
  }, [optimisticPosts, remotePosts]);

  const allPosts = useMemo(() => {
    return basePosts.map((post) => ({
      ...post,
      ...engagementOverrides[post.id],
    }));
  }, [basePosts, engagementOverrides]);

  useEffect(() => {
    if (!isLoggedIn) {
      setEngagementOverrides({});
      return;
    }

    let cancelled = false;
    fetchCommunityReactionSummary()
      .then((summary) => {
        if (cancelled) return;
        const liked = new Set(summary.likedPostIds);
        const saved = new Set(summary.savedPostIds);
        setEngagementOverrides((current) => {
          const next = { ...current };
          basePosts.forEach((post) => {
            next[post.id] = {
              ...next[post.id],
              liked: liked.has(post.id),
              saved: saved.has(post.id),
            };
          });
          return next;
        });
      })
      .catch(() => {
        if (!cancelled) setEngagementOverrides({});
      });

    return () => {
      cancelled = true;
    };
  }, [basePosts, isLoggedIn]);

  const updatePostEngagement = (updatedPost: CommunityFeedPost) => {
    setEngagementOverrides((current) => ({
      ...current,
      [updatedPost.id]: {
        liked: updatedPost.liked,
        likes: updatedPost.likes,
        saved: updatedPost.saved,
        saves: updatedPost.saves,
      },
    }));
    setSelectedPost((current) =>
      current?.id === updatedPost.id ? { ...current, ...updatedPost } : current,
    );
  };

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const byChannel =
      activeChannel === "All"
        ? allPosts
        : allPosts.filter((post) => post.channel === activeChannel);

    const bySearch = normalizedQuery
      ? byChannel.filter((post) =>
          [
            post.title,
            post.excerpt,
            post.location,
            post.route,
            post.channel,
            post.mood,
            ...post.tags,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : byChannel;

    return sortPosts(bySearch, sortMode);
  }, [activeChannel, allPosts, query, sortMode]);

  // Combine posts, briefs, and dispatch card into a single masonry array
  const masonryItems = useMemo(() => {
    type MasonryItem =
      | { type: "post"; data: CommunityFeedPost }
      | { type: "brief"; data: FieldBrief }
      | { type: "dispatch"; id: string };

    const items: MasonryItem[] = [];
    const posts = [...filteredPosts];
    const briefs = [...fieldBriefs];

    // Always insert dispatch CTA near the top
    items.push({ type: "dispatch", id: "dispatch-cta" });

    // Mix posts and briefs
    let postIndex = 0;
    let briefIndex = 0;

    // Pattern: 2 posts, 1 brief, 3 posts, 1 brief, etc.
    while (postIndex < posts.length || briefIndex < briefs.length) {
      if (postIndex < posts.length) {
        items.push({ type: "post", data: posts[postIndex++] });
      }
      if (postIndex < posts.length) {
        items.push({ type: "post", data: posts[postIndex++] });
      }
      if (briefIndex < briefs.length) {
        items.push({ type: "brief", data: briefs[briefIndex++] });
      }
      if (postIndex < posts.length) {
        items.push({ type: "post", data: posts[postIndex++] });
      }
    }

    return items;
  }, [filteredPosts, fieldBriefs]);

  const selectBrief = (brief: FieldBrief) => {
    setSelectedBrief(brief);
    const channel = coerceChannel(brief.channel);
    setDraft((current) => ({
      ...current,
      location: brief.location,
      route: brief.route,
      mood: brief.mood,
      channel,
    }));
    setActiveChannel(channel);
  };

  const resolveVariant = (
    post: CommunityFeedPost,
  ): "image" | "feature" | "text" => {
    const hasImage = Boolean(post.image);
    const hasText = Boolean(post.excerpt.trim());

    if (!hasImage) return "text";
    if (!hasText || post.excerpt.trim().length < 28) return "feature";
    return "image";
  };

  const handleGoogleLogin = async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setToast(t("community.error.googleNotConfigured"));
      return;
    }
    if (!getGoogleIdentityApi()) {
      setToast(t("community.error.googleScriptNotLoaded"));
      return;
    }
    try {
      const credential = await requestGoogleCredential(clientId);
      await signInWithGoogle(credential);
      syncAuth();
      setToast(AUTH_PROMPTS.googleConnectedPublish);
    } catch {
      setToast(t("community.error.googleSignInFailed"));
    }
  };

  const openFieldKit = () => {
    if (!isLoggedIn) {
      setToast(AUTH_PROMPTS.connectGoogleToPublish);
      return;
    }
    setIsKitOpen(true);
  };

  const handleKitPublish = async (kitDraft: {
    title: string;
    note: string;
    channel: PostChannel;
    image?: string;
  }) => {
    const title = kitDraft.title.trim();
    const note = kitDraft.note.trim();

    setDraft((prev) => ({
      ...prev,
      title: kitDraft.title,
      note: kitDraft.note,
      channel: kitDraft.channel,
      image: kitDraft.image,
    }));

    if (!isLoggedIn) {
      setToast(AUTH_PROMPTS.connectGoogleToPublish);
      throw new Error(AUTH_PROMPTS.connectGoogleToPublish);
    }

    if (!title && !note && !kitDraft.image) {
      setToast(t("community.error.addContent"));
      throw new Error(t("community.error.addContent"));
    }

    try {
      const created = await createCommunityFeedPost(
        {
          title,
          note,
          channel: kitDraft.channel,
          image: kitDraft.image,
          location: draft.location || selectedBrief?.location || "",
          route: draft.route || selectedBrief?.route || "",
          mood: draft.mood || selectedBrief?.mood || "",
          user: {
            id: user?.id,
            email: user?.email,
            name: user?.name || "LingTour Guest",
            handle: user?.email ? `@${user.email.split("@")[0]}` : "@you",
            avatar: user?.avatarUrl || "",
          },
        },
        locale,
      );

      const nextPosts = [created, ...optimisticPosts];
      const nextStamps = stampCount + 1;
      setOptimisticPosts(nextPosts);
      setStampCount(nextStamps);
      writeSyncedCommunityPosts(nextPosts);
      window.localStorage.setItem(LOCAL_STAMPS_KEY, String(nextStamps));
      setDraft(draftFromBrief(selectedBrief));
      setActiveChannel("All");
      setSortMode("Live");
      setIsKitOpen(false);
      setToast(
        created.status === "pending_review"
          ? t("community.success.pendingReview")
          : t("community.success.published"),
      );
      refetch();
    } catch (publishError) {
      const message =
        publishError instanceof Error
          ? publishError.message
          : t("community.error.submitFailed");
      setToast(message);
      throw publishError instanceof Error ? publishError : new Error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)]">
      <section className="relative isolate overflow-hidden bg-[var(--night)] py-14 text-white sm:py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_12%,rgba(197,160,57,0.16),transparent_30%),radial-gradient(circle_at_88%_22%,rgba(83,131,147,0.2),transparent_36%)]" />
        <div className="site-container relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16">
          <Reveal>
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.26em] text-[var(--gold)]">{t("community.badge")}</p>
              <h1 className="mt-6 max-w-[10ch] font-[family:var(--font-display)] text-5xl leading-[0.86] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
                {t("community.hero.title")} <span className="italic text-[var(--gold)]">{t("community.hero.titleAccent")}</span>
              </h1>
              <p className="mt-7 max-w-[42rem] text-base leading-8 text-white/62 lg:text-lg">{t("community.hero.subtitle")}</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-[var(--radius-xl)] border border-white/12 bg-white/[0.05] p-5 backdrop-blur-sm sm:p-6">
              <div className="flex items-center justify-between gap-4 border-b border-white/12 pb-5">
                <div>
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[var(--gold)]">Signal desk</p>
                  <p className="mt-2 text-sm text-white/48">Live field intelligence</p>
                </div>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-40 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
                </span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-4">
                {[
                  { label: "Signals", value: allPosts.length },
                  { label: "Briefs", value: fieldBriefs.length },
                  { label: "Stamps", value: stampCount },
                ].map((metric) => (
                  <div key={metric.label}>
                    <p className="font-[family:var(--font-display)] text-3xl">{String(metric.value).padStart(2, "0")}</p>
                    <p className="mt-2 font-mono text-[7px] font-bold uppercase tracking-[0.16em] text-white/34">{metric.label}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={isLoggedIn ? openFieldKit : handleGoogleLogin}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--gold)] px-5 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--night)] transition hover:bg-white"
              >
                {isLoggedIn ? "Open field kit" : "Connect to publish"}
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="sticky top-[4.5rem] z-20 border-b border-[var(--line)] bg-[var(--paper-deep)]/94 py-3 backdrop-blur-xl">
        <div className="site-container grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {channels.map((channel) => (
              <button
                key={channel}
                type="button"
                onClick={() => setActiveChannel(channel)}
                aria-pressed={activeChannel === channel}
                className={`min-h-10 shrink-0 rounded-full border px-4 py-2 font-mono text-[8px] font-bold uppercase tracking-[0.15em] transition ${
                  activeChannel === channel
                    ? "border-[var(--river-deep)] bg-[var(--river-deep)] text-white"
                    : "border-[var(--line)] bg-white/62 text-[var(--muted)] hover:border-[var(--river-deep)] hover:text-[var(--river-deep)]"
                }`}
              >
                {t(CHANNEL_I18N[channel])}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 lg:flex lg:items-center">
            <label className="relative min-w-0 lg:w-56">
              <span className="sr-only">{t("community.search.placeholder")}</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("community.search.placeholder")}
                className="h-11 w-full rounded-full border border-[var(--line)] bg-white/72 pl-9 pr-4 text-sm outline-none transition focus:border-[var(--river-deep)] focus:bg-white"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </label>
            <div className="flex rounded-full border border-[var(--line)] bg-white/62 p-1">
              {(["Live", "Loved", "Saved"] as SortMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setSortMode(mode)}
                  aria-pressed={sortMode === mode}
                  className={`min-h-9 rounded-full px-3 font-mono text-[7px] font-bold uppercase tracking-[0.13em] transition ${
                    sortMode === mode ? "bg-[var(--river-deep)] text-white" : "text-[var(--muted)] hover:text-[var(--river-deep)]"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-container py-8 sm:py-10 lg:py-14">
        {loading && !masonryItems.length ? (
          <div className="py-20 text-center">
            <p className="text-base text-[var(--muted)]">
              {t("community.loading")}
            </p>
          </div>
        ) : error && !masonryItems.length ? (
          <div className="py-20 text-center">
            <p className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)]">
              {t("community.error.feedOffline")}
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">{error}</p>
            <button
              type="button"
              onClick={refetch}
              className="lt-action lt-action-secondary mt-6"
            >
              {t("common.btn.retry")}
            </button>
          </div>
        ) : (
          <div className="columns-1 gap-5 space-y-5 pb-20 sm:columns-2 lg:columns-3 xl:columns-4">
            {masonryItems.length ? (
              masonryItems.map((item, index) => {
                if (item.type === "dispatch") {
                  return (
                    <div key={item.id} className="break-inside-avoid">
                      <Reveal delay={index * 40}>
                        <DispatchCard
                          stampCount={stampCount}
                          onDispatch={openFieldKit}
                          isLoggedIn={isLoggedIn}
                          onLogin={handleGoogleLogin}
                        />
                      </Reveal>
                    </div>
                  );
                }

                if (item.type === "brief") {
                  return (
                    <div key={item.data.id} className="break-inside-avoid">
                      <Reveal delay={index * 40}>
                        <BriefCard
                          brief={item.data}
                          onSelect={(brief) => {
                            selectBrief(brief);
                            openFieldKit();
                          }}
                        />
                      </Reveal>
                    </div>
                  );
                }

                if (item.type === "post") {
                  return (
                    <div key={item.data.id} className="break-inside-avoid">
                      <Reveal delay={index * 40}>
                        <PostCard
                          post={item.data}
                          variant={resolveVariant(item.data)}
                          onOpen={setSelectedPost}
                          isLoggedIn={isLoggedIn}
                          onRequireLogin={() => setToast(AUTH_PROMPTS.connectGoogleToInteract)}
                          onEngagementChange={updatePostEngagement}
                        />
                      </Reveal>
                    </div>
                  );
                }

                return null;
              })
            ) : (
              <div className="col-span-full py-20 text-center break-inside-avoid">
                <p className="font-[family:var(--font-display)] text-4xl text-[var(--muted)] opacity-30">
                  {t("community.empty")}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      <FieldKit
        isOpen={isKitOpen}
        onClose={() => setIsKitOpen(false)}
        isLoggedIn={isLoggedIn}
        onRequireLogin={() =>
          setToast(AUTH_PROMPTS.connectGoogleToPublish)
        }
        onPublish={handleKitPublish}
        initialBrief={
          selectedBrief
            ? {
                title: selectedBrief.title,
                prompt: selectedBrief.prompt,
                channel: coerceChannel(selectedBrief.channel),
              }
            : undefined
        }
        initialDraft={{
          title: draft.title,
          note: draft.note,
          channel: draft.channel,
          image: draft.image,
        }}
        channels={channels}
      />

      <PostDetailDialog
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        currentUser={
          user
            ? {
                name: user.name,
                handle: user.email ? `@${user.email.split("@")[0]}` : undefined,
                avatar: user.avatarUrl,
              }
            : null
        }
      />

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--night)] px-5 py-3 text-sm text-white shadow-[0_18px_50px_rgba(17,25,35,0.24)]">
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-white/55 hover:text-white"
          >
            {t("community.toast.close")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
