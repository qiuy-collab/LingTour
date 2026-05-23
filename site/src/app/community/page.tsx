"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AUTH_PROMPTS } from "@/lib/auth-prompts";
import {
  createCommunityFeedPost,
  fetchCommunityFeed,
  fetchCommunityBriefs,
  type CommunityFeedPost,
  type FieldBrief,
} from "@/lib/api-data";
import { useApiQuery } from "@/lib/use-api-query";
import { PostCard } from "@/components/community/PostCard";
import { PostDetailDialog } from "@/components/community/PostDetailDialog";
import { Reveal } from "@/components/ui/Reveal";
import { FieldKit } from "@/components/community/FieldKit";
import { useLocale } from "@/lib/locale-context";
import { LocalUser, readStoredUser, signInWithGoogle } from "@/lib/auth-client";

const channels = [
  "All",
  "Field Notes",
  "Food Map",
  "Hidden Stop",
  "Culture Desk",
] as const;
type Channel = (typeof channels)[number];
type PostChannel = Exclude<Channel, "All">;
type SortMode = "Live" | "Loved" | "Discussed";

type Draft = {
  title: string;
  note: string;
  location: string;
  route: string;
  mood: string;
  channel: PostChannel;
  image?: string;
};

const LOCAL_POSTS_KEY = "lingtour-community-posts";
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

function readLocalPosts() {
  if (typeof window === "undefined") return [] as CommunityFeedPost[];
  try {
    const raw = window.localStorage.getItem(LOCAL_POSTS_KEY);
    return raw ? (JSON.parse(raw) as CommunityFeedPost[]) : [];
  } catch {
    return [] as CommunityFeedPost[];
  }
}

function writeLocalPosts(posts: CommunityFeedPost[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
}

function sortPosts(posts: CommunityFeedPost[], sortMode: SortMode) {
  return [...posts].sort((a, b) => {
    if (sortMode === "Loved") return b.likes - a.likes;
    if (sortMode === "Discussed") return b.comments - a.comments;
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
  const { locale } = useLocale();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [optimisticPosts, setOptimisticPosts] = useState<CommunityFeedPost[]>(
    [],
  );
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
    setOptimisticPosts(readLocalPosts());
    const storedStamps = Number(
      window.localStorage.getItem(LOCAL_STAMPS_KEY) || "0",
    );
    setStampCount(Number.isFinite(storedStamps) ? storedStamps : 0);
    window.addEventListener("lingtour-auth", syncAuth);
    return () => window.removeEventListener("lingtour-auth", syncAuth);
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

  const allPosts = useMemo(() => {
    const merged = [...optimisticPosts, ...(remotePosts ?? [])];
    const seen = new Set<string>();
    return merged.filter((post) => {
      if (seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });
  }, [optimisticPosts, remotePosts]);

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
    await signInWithGoogle();
    syncAuth();
    setToast(AUTH_PROMPTS.googleConnectedPublish);
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
      setToast("Add a title, note, or photo before publishing.");
      throw new Error("Add a title, note, or photo before publishing.");
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
      writeLocalPosts(nextPosts);
      window.localStorage.setItem(LOCAL_STAMPS_KEY, String(nextStamps));
      setDraft(draftFromBrief(selectedBrief));
      setActiveChannel("All");
      setSortMode("Live");
      setIsKitOpen(false);
      setToast(
        created.status === "pending_review"
          ? "Posted to review queue. It is pinned here for you while awaiting approval."
          : "Published. You earned 1 field stamp.",
      );
      refetch();
    } catch (publishError) {
      const message =
        publishError instanceof Error
          ? publishError.message
          : "Could not submit your field note right now.";
      setToast(message);
      throw publishError instanceof Error ? publishError : new Error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--paper-deep)] bg-grain text-[var(--river-deep)]">
      <section className="relative overflow-hidden border-b border-[var(--line)] py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(182,66,53,0.08),transparent_24rem),radial-gradient(circle_at_88%_18%,rgba(124,155,134,0.12),transparent_28rem)]" />
        <div className="site-container relative text-center">
          <Reveal>
            <p className="text-label tracking-[0.3em] text-[var(--cinnabar)]">
              The LingTour Field Room
            </p>
            <h1 className="mt-8 font-[family:var(--font-display)] text-6xl leading-[0.85] tracking-[-0.05em] md:text-9xl lg:text-[10rem]">
              Captured <br />
              <span className="italic text-[var(--gold)]">Signals.</span>
            </h1>
            <p className="handwritten mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-[var(--muted)]">
              Pick a brief, publish a dispatch, and trade useful replies. <br />
              Turn quiet details into shared route intelligence.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="site-container py-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-16">
            <div className="flex flex-wrap items-center justify-between gap-6 border-b border-[var(--line)] pb-8">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {channels.map((channel) => (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setActiveChannel(channel)}
                    className={`shrink-0 rounded-full px-6 py-2 text-sm font-bold transition-all ${
                      activeChannel === channel
                        ? "scale-105 bg-[var(--river-deep)] text-white shadow-lg"
                        : "bg-white/40 text-[var(--muted)] hover:bg-white"
                    }`}
                  >
                    {channel}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Filter by mood, route..."
                  className="h-11 w-48 rounded-full border border-[var(--line)] bg-white/50 px-5 text-sm outline-none focus:border-[var(--cinnabar)] focus:bg-white"
                />
              </div>
            </div>

            {loading && !allPosts.length ? (
              <div className="py-20 text-center">
                <p className="handwritten text-lg text-[var(--muted)]">
                  Collecting live dispatches...
                </p>
              </div>
            ) : error && !allPosts.length ? (
              <div className="py-20 text-center">
                <p className="font-[family:var(--font-display)] text-4xl text-[var(--river-deep)]">
                  Feed offline.
                </p>
                <p className="mt-4 text-sm text-[var(--muted)]">{error}</p>
                <button
                  type="button"
                  onClick={refetch}
                  className="mt-6 border border-[var(--line)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--river-deep)] transition hover:bg-[var(--river-deep)] hover:text-white"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                {filteredPosts.length ? (
                  filteredPosts.map((post, index) => (
                    <Reveal key={post.id} delay={index * 50}>
                      <div
                        className={`
                          ${index % 3 === 0 ? "md:col-span-2 lg:col-span-1" : ""}
                          ${index % 4 === 1 ? "md:translate-y-12" : ""}
                          ${index % 4 === 2 ? "md:-translate-y-8" : ""}
                        `}
                      >
                        <PostCard
                          post={post}
                          index={index}
                          variant={resolveVariant(post)}
                          onOpen={setSelectedPost}
                          isLoggedIn={isLoggedIn}
                          onRequireLogin={() =>
                            setToast(AUTH_PROMPTS.connectGoogleToInteract)
                          }
                        />
                      </div>
                    </Reveal>
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="font-[family:var(--font-display)] text-4xl text-[var(--muted)] opacity-30">
                      No signals in this range.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-12">
            <div className="sticky top-24 space-y-12">
              <div className="scrapbook-shadow rounded-[2rem] border border-[var(--line)] bg-white/40 p-8">
                <p className="text-label text-[var(--cinnabar)]">
                  Active Briefs
                </p>
                {fieldBriefs.length === 0 ? (
                  <p className="mt-6 text-sm leading-relaxed text-[var(--muted)] handwritten">
                    No briefs published yet. The editorial team is preparing the
                    next round.
                  </p>
                ) : (
                  <div className="mt-8 space-y-6">
                    {fieldBriefs.map((brief) => {
                      const isActive = selectedBrief?.id === brief.id;
                      return (
                        <button
                          key={brief.id}
                          onClick={() => selectBrief(brief)}
                          className={`group block w-full text-left transition-all ${
                            isActive ? "scale-105" : "hover:translate-x-2"
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">
                            {brief.channel}
                          </p>
                          <p
                            className={`mt-1 font-[family:var(--font-display)] text-xl transition-colors ${
                              isActive
                                ? "text-[var(--cinnabar)]"
                                : "text-[var(--river-deep)] group-hover:text-[var(--cinnabar)]"
                            }`}
                          >
                            {brief.title}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rotate-1 bg-[var(--night)] p-8 text-white shadow-2xl">
                <h3 className="font-[family:var(--font-display)] text-3xl italic text-[var(--gold)]">
                  Dispatch Now
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  Field work is about the unseen. Share a detail that is not on
                  the main map.
                </p>
                <div className="mt-8 flex flex-col gap-4">
                  <button
                    onClick={openFieldKit}
                    className="w-full rounded-full bg-white py-4 text-sm font-bold text-[var(--night)] transition-transform hover:scale-105 active:scale-95"
                  >
                    {isLoggedIn
                      ? "Open Field Kit"
                      : "Connect Google to Publish"}
                  </button>
                  {!isLoggedIn ? (
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full rounded-full border border-white/20 py-4 text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                    >
                      Connect Google
                    </button>
                  ) : (
                    <Link
                      href="/routes"
                      className="w-full rounded-full border border-white/20 py-4 text-center text-sm font-bold text-white transition hover:border-white hover:bg-white/10"
                    >
                      Browse active routes
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
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
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
