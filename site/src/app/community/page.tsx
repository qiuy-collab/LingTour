"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { communityPosts, type CommunityPost } from "@/data/mock/community-posts";
import { PostCard } from "@/components/community/PostCard";
import { Reveal } from "@/components/ui/Reveal";
import { FieldPassport } from "@/components/community/FieldPassport";
import { FieldKit } from "@/components/community/FieldKit";
import { LocalUser, readStoredUser, signInWithGoogle } from "@/lib/auth-client";

const channels = ["All", "Field Notes", "Food Map", "Hidden Stop", "Culture Desk"] as const;
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

const fieldBriefs = [
  {
    id: "before-breakfast",
    title: "Before breakfast",
    channel: "Food Map" as PostChannel,
    location: "Zhanjiang",
    route: "Seafood Dawn",
    mood: "Early, loud, alive",
    prompt: "Find one thing that only happens before the city fully wakes up.",
  },
  {
    id: "after-rain",
    title: "After rain",
    channel: "Culture Desk" as PostChannel,
    location: "Xiashan",
    route: "Old Streets",
    mood: "Soft weather",
    prompt: "Record a street, facade, smell, or sound that changes after rain.",
  },
  {
    id: "quiet-detour",
    title: "Quiet detour",
    channel: "Hidden Stop" as PostChannel,
    location: "Naozhou",
    route: "Island Day",
    mood: "Slow clock",
    prompt: "Share a place that is not a headline, but made the day better.",
  },
];

const routeRooms = [
  { label: "Seafood Dawn", count: 24, tone: "Market heat" },
  { label: "Old Streets", count: 18, tone: "Rain texture" },
  { label: "Island Day", count: 15, tone: "Ferry notes" },
  { label: "Craft Stop", count: 11, tone: "Hands-on" },
];

const channelImages: Record<PostChannel, string> = {
  "Field Notes": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=900&fit=crop",
  "Food Map": "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=1200&h=900&fit=crop",
  "Hidden Stop": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=900&fit=crop",
  "Culture Desk": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=900&fit=crop",
};

function readLoginState() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem("lingtour-user") || window.localStorage.getItem("lingtour-token"));
}

function readUser(): LocalUser | null {
  return readStoredUser();
}

function readLocalPosts() {
  if (typeof window === "undefined") return [] as CommunityPost[];
  try {
    const raw = window.localStorage.getItem("lingtour-community-posts");
    return raw ? (JSON.parse(raw) as CommunityPost[]) : [];
  } catch {
    return [] as CommunityPost[];
  }
}

function sortPosts(posts: CommunityPost[], sortMode: SortMode) {
  return [...posts].sort((a, b) => {
    if (sortMode === "Loved") return b.likes - a.likes;
    if (sortMode === "Discussed") return b.comments - a.comments;
    return 0;
  });
}

const emptyDraft = (brief = fieldBriefs[0]): Draft => ({
  title: "",
  note: "",
  location: brief.location,
  route: brief.route,
  mood: brief.mood,
  channel: brief.channel,
});

export default function CommunityPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel>("All");
  const [sortMode, setSortMode] = useState<SortMode>("Live");
  const [query, setQuery] = useState("");
  const [selectedBrief, setSelectedBrief] = useState(fieldBriefs[0]);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(fieldBriefs[0]));
  const [toast, setToast] = useState<string | null>(null);
  const [stampCount, setStampCount] = useState(0);
  const [isKitOpen, setIsKitOpen] = useState(false);

  const syncAuth = () => {
    setIsLoggedIn(readLoginState());
    setUser(readUser());
  };

  useEffect(() => {
    syncAuth();
    setLocalPosts(readLocalPosts());
    const storedStamps = Number(window.localStorage.getItem("lingtour-community-stamps") || "0");
    setStampCount(Number.isFinite(storedStamps) ? storedStamps : 0);
    window.addEventListener("lingtour-auth", syncAuth);
    return () => window.removeEventListener("lingtour-auth", syncAuth);
  }, []);

  const allPosts = useMemo(() => [...localPosts, ...communityPosts], [localPosts]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const byChannel = activeChannel === "All" ? allPosts : allPosts.filter((post) => post.channel === activeChannel);
    const bySearch = normalizedQuery
      ? byChannel.filter((post) =>
          [post.title, post.excerpt, post.location, post.route, post.channel, post.mood, ...post.tags]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        )
      : byChannel;

    return sortPosts(bySearch, sortMode);
  }, [activeChannel, allPosts, query, sortMode]);

  const featuredPost = filteredPosts[0] ?? allPosts[0];
  const previewReady = draft.title.trim().length > 0 || draft.note.trim().length > 0;

  const selectBrief = (brief: (typeof fieldBriefs)[number]) => {
    setSelectedBrief(brief);
    setDraft((current) => ({
      ...current,
      location: brief.location,
      route: brief.route,
      mood: brief.mood,
      channel: brief.channel,
    }));
    setActiveChannel(brief.channel);
  };

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
    syncAuth();
    setToast("Google connected. You can publish now.");
  };

  const publishPost = () => {
    if (!isLoggedIn) {
      setToast("Connect Google first, then publish your field note.");
      return;
    }

    const title = draft.title.trim();
    const note = draft.note.trim();
    if (!title || !note) {
      setToast("Add a title and a field note before publishing.");
      return;
    }

    const newPost: CommunityPost = {
      id: `local-${Date.now()}`,
      user: {
        name: user?.name || "Google Traveler",
        handle: "@you",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop",
      },
      image: draft.image || channelImages[draft.channel],
      title,
      excerpt: note,
      location: draft.location || selectedBrief.location,
      route: draft.route || selectedBrief.route,
      date: "Just now",
      readTime: "1 min",
      channel: draft.channel,
      mood: draft.mood || selectedBrief.mood,
      tags: [selectedBrief.title, draft.channel, draft.location || selectedBrief.location],
      likes: 0,
      comments: 0,
      saves: 0,
      prompt: selectedBrief.prompt,
    };

    const nextPosts = [newPost, ...localPosts];
    const nextStamps = stampCount + 1;
    setLocalPosts(nextPosts);
    setStampCount(nextStamps);
    window.localStorage.setItem("lingtour-community-posts", JSON.stringify(nextPosts));
    window.localStorage.setItem("lingtour-community-stamps", String(nextStamps));
    setDraft(emptyDraft(selectedBrief));
    setActiveChannel("All");
    setSortMode("Live");
    setIsKitOpen(false);
    setToast("Published. You earned 1 field stamp.");
  };

  const handleKitPublish = (kitDraft: { title: string; note: string; channel: PostChannel; image?: string }) => {
    // Synchronize draft state then publish
    setDraft((prev) => ({
      ...prev,
      title: kitDraft.title,
      note: kitDraft.note,
      channel: kitDraft.channel,
      image: kitDraft.image,
    }));
    // We'll call publishPost in the next tick or just use a direct version
  };

  // Improved publish for FieldKit
  useEffect(() => {
    if (draft.title && draft.note && isKitOpen) {
      publishPost();
    }
  }, [draft]);

  return (
    <div className="min-h-screen bg-[var(--paper-deep)] text-[var(--river-deep)] bg-grain">
      <section className="relative overflow-hidden border-b border-[var(--line)] py-20 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_16%,rgba(182,66,53,0.08),transparent_24rem),radial-gradient(circle_at_88%_18%,rgba(124,155,134,0.12),transparent_28rem)]" />
        <div className="site-container relative text-center">
          <Reveal>
            <p className="text-label text-[var(--cinnabar)] tracking-[0.3em]">The LingTour Field Room</p>
            <h1 className="mt-8 font-[family:var(--font-display)] text-6xl leading-[0.85] tracking-[-0.05em] md:text-9xl lg:text-[10rem]">
              Captured <br />
              <span className="italic text-[var(--gold)]">Signals.</span>
            </h1>
            <p className="mx-auto mt-12 max-w-2xl text-lg leading-relaxed text-[var(--muted)] handwritten">
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
                        ? "bg-[var(--river-deep)] text-white shadow-lg scale-105"
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
                      <PostCard post={post} index={index} variant="image" />
                    </div>
                  </Reveal>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <p className="font-[family:var(--font-display)] text-4xl text-[var(--muted)] opacity-30">No signals in this range.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-12">
            <div className="sticky top-24 space-y-12">
              <FieldPassport stampCount={stampCount} />

              <div className="rounded-[2rem] border border-[var(--line)] bg-white/40 p-8 scrapbook-shadow">
                <p className="text-label text-[var(--cinnabar)]">Active Briefs</p>
                <div className="mt-8 space-y-6">
                  {fieldBriefs.map((brief) => (
                    <button
                      key={brief.id}
                      onClick={() => selectBrief(brief)}
                      className={`group block w-full text-left transition-all ${selectedBrief.id === brief.id ? "scale-105" : "hover:translate-x-2"}`}
                    >
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted)]">{brief.channel}</p>
                      <p className={`mt-1 font-[family:var(--font-display)] text-xl transition-colors ${selectedBrief.id === brief.id ? "text-[var(--cinnabar)]" : "text-[var(--river-deep)] group-hover:text-[var(--cinnabar)]"}`}>
                        {brief.title}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-[var(--night)] p-8 text-white shadow-2xl rotate-1">
                <h3 className="font-[family:var(--font-display)] text-3xl italic text-[var(--gold)]">Dispatch Now</h3>
                <p className="mt-4 text-sm text-white/50 leading-relaxed">
                  Field work is about the "unseen". Share a detail that isn't on the main map.
                </p>
                <button
                  onClick={() => setIsKitOpen(true)}
                  className="mt-8 w-full rounded-full bg-white py-4 text-sm font-bold text-[var(--night)] transition-transform hover:scale-105 active:scale-95"
                >
                  Open Field Kit
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <FieldKit
        isOpen={isKitOpen}
        onClose={() => setIsKitOpen(false)}
        onPublish={handleKitPublish}
        initialBrief={selectedBrief}
        channels={channels}
      />

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--night)] px-5 py-3 text-sm text-white shadow-[0_18px_50px_rgba(17,25,35,0.24)]">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast(null)} className="text-white/55 hover:text-white">
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
